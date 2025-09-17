import { NextResponse } from "next/server";
import { z } from "zod";

import { expectedUtility } from "@/lib/math/expectedUtility";
import { queueWaitMGS } from "@/lib/math/queueWait";
import { phat, type FeatureVec } from "@/lib/math/logistic";
import type { OptimizePayload, OptimizeResult } from "@/lib/types";

const payloadSchema = z.object({
  slotStart: z.string(),
  capacityS: z.number().int().positive(),
  priceCents: z.number().int().nonnegative(),
  penalties: z.object({
    over: z.number().nonnegative(),
    under: z.number().nonnegative(),
  }),
  bookedClientIds: z.array(z.string()).default([]),
  slaMinutes: z.number().positive().optional(),
  slotMinutes: z.number().positive().optional(),
});

const beta: FeatureVec = {
  bias: -0.35,
  dow_weekend: -0.2,
  hour_morning: 0.15,
  lead: 0.02,
  price: -0.00002,
};

function buildFeatureVector(date: Date, priceCents: number): FeatureVec {
  const dow = date.getUTCDay();
  const hour = date.getUTCHours();
  return {
    bias: 1,
    dow_weekend: dow === 0 || dow === 6 ? 1 : 0,
    hour_morning: hour >= 7 && hour < 12 ? 1 : 0,
    lead: Math.max(12, (date.getTime() - Date.now()) / 1000 / 3600),
    price: priceCents,
  };
}

export async function POST(request: Request) {
  let payload: OptimizePayload;
  try {
    const json = await request.json();
    const parsed = payloadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    payload = parsed.data;
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const slotDate = new Date(payload.slotStart);
  if (Number.isNaN(slotDate.getTime())) {
    return NextResponse.json({ error: "slotStart must be a valid ISO date" }, { status: 400 });
  }

  const feature = buildFeatureVector(slotDate, payload.priceCents);
  const probabilities = payload.bookedClientIds.length
    ? payload.bookedClientIds.map(() => phat(beta, feature))
    : [phat(beta, feature)];
  const pBar = probabilities.reduce((acc, value) => acc + value, 0) / probabilities.length;

  const slotMinutes = payload.slotMinutes ?? 60;
  const slaMinutes = payload.slaMinutes ?? 20;
  const serviceTimeHours = slotMinutes / 60;
  const candidates = [payload.capacityS, payload.capacityS + 1, payload.capacityS + 2];

  let best: { result: OptimizeResult; utility: number; meetsSla: boolean } | null = null;

  for (const candidate of candidates) {
    const utility = expectedUtility(
      candidate,
      payload.capacityS,
      payload.priceCents,
      payload.penalties.over,
      payload.penalties.under,
      pBar,
    );
    const lambda = (candidate * pBar) / serviceTimeHours;
    const Wq = queueWaitMGS(lambda, serviceTimeHours, 0.5, payload.capacityS);
    const result: OptimizeResult = {
      n_star: candidate,
      expected_utility: utility,
      p_bar: pBar,
      Wq,
    };
    const meetsSla = Wq <= slaMinutes;
    if (!best) {
      best = { result, utility, meetsSla };
      continue;
    }
    if (meetsSla && !best.meetsSla) {
      best = { result, utility, meetsSla };
      continue;
    }
    if (meetsSla === best.meetsSla && utility > best.utility) {
      best = { result, utility, meetsSla };
    }
  }

  if (!best) {
    return NextResponse.json({ error: "Unable to evaluate candidates" }, { status: 500 });
  }

  return NextResponse.json(best.result);
}
