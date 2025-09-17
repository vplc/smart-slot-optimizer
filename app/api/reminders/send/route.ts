import { NextResponse } from "next/server";
import { z } from "zod";

import { thompson, type BetaAB } from "@/lib/bandit";
import type { ReminderVariant } from "@/lib/types";

const payloadSchema = z.object({
  userId: z.string().uuid(),
  appointmentId: z.string().uuid(),
  consentSms: z.boolean().optional(),
});

const defaultBandit: Record<ReminderVariant, BetaAB> = {
  "T-24": { a: 2, b: 2 },
  "T-6": { a: 3, b: 2 },
  "T-2": { a: 1.5, b: 2.5 },
};

export async function POST(request: Request) {
  let payload: z.infer<typeof payloadSchema>;
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

  if (payload.consentSms === false) {
    return NextResponse.json({
      status: "skipped",
      reason: "Customer has not opted into SMS reminders.",
    });
  }

  // TODO: fetch real bandit state from Supabase.
  const variant = thompson(defaultBandit);

  // Twilio integration stub – replace with actual API call when credentials are configured.
  console.info("[twilio] would send reminder", {
    userId: payload.userId,
    appointmentId: payload.appointmentId,
    variant,
  });

  return NextResponse.json({
    status: "queued",
    variant,
    message: `Reminder scheduled for variant ${variant}`,
  });
}
