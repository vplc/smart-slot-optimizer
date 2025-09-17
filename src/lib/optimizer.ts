import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { getOrCreatePolicy } from "./policy";
import type { Policy } from "./types";
import { OptimizeReq } from "./validators";
import { captureTelemetry } from "./telemetry";

const clampProbability = (value: number): number => {
  if (Number.isNaN(value)) return 0.5;
  return Math.min(Math.max(value, 0.05), 0.98);
};

export const logistic = (x: number): number => 1 / (1 + Math.exp(-x));

export const phat = (
  features: Record<string, number>,
  coefficients: Record<string, number> | null,
  baseline: number
): number => {
  if (!coefficients || Object.keys(coefficients).length === 0) {
    return clampProbability(baseline);
  }

  const base = clampProbability(baseline);
  const intercept =
    typeof coefficients.intercept === "number"
      ? coefficients.intercept
      : Math.log(base / (1 - base));

  let score = intercept;
  for (const [key, value] of Object.entries(features)) {
    const beta = coefficients[key];
    if (typeof beta === "number" && Number.isFinite(value)) {
      score += beta * value;
    }
  }

  return clampProbability(logistic(score));
};

const combination = (n: number, k: number): number => {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result = (result * (n - k + i)) / i;
  }
  return result;
};

export const expectedUtility = (n: number, policy: Policy, showProbability: number): number => {
  let total = 0;
  const p = clampProbability(showProbability);
  const q = 1 - p;

  for (let k = 0; k <= n; k++) {
    const prob = combination(n, k) * Math.pow(p, k) * Math.pow(q, n - k);
    const served = Math.min(k, policy.capacityS);
    const overtime = Math.max(0, k - policy.capacityS);
    const idle = Math.max(0, policy.capacityS - k);
    const reward = served * policy.priceCents;
    const penalties = overtime * policy.cOverCents + idle * policy.uUnderCents;
    total += prob * (reward - penalties);
  }

  return total;
};

export const queueWaitMGS = (
  lambda: number,
  meanServiceHours: number,
  scv: number,
  servers: number
): number => {
  if (!Number.isFinite(lambda) || lambda <= 0) return 0;
  if (!Number.isFinite(meanServiceHours) || meanServiceHours <= 0) return 0;
  if (servers <= 0) return 0;

  const rho = (lambda * meanServiceHours) / servers;
  if (rho <= 0) return 0;
  if (rho >= 1) {
    return Number.POSITIVE_INFINITY;
  }

  const ca2 = 1; // Poisson arrivals
  const cs2 = Math.max(scv, 0);
  const C = (ca2 + cs2) / 2;
  const powTerm = Math.pow(rho, Math.sqrt(2 * (servers + 1)));
  const wqHours = (C * powTerm) / (servers * (1 - rho)) * meanServiceHours;

  return Math.max(0, wqHours * 60);
};

export interface UtilityPoint {
  n: number;
  utility: number;
  wait: number;
  slaOk: boolean;
}

export const evaluateBookingLevels = (
  policy: Policy,
  showProbability: number
): { utilities: UtilityPoint[]; best: UtilityPoint | null } => {
  const maxN = Math.max(1, policy.capacityS + policy.maxOverbook);
  const utilities: UtilityPoint[] = [];
  let best: UtilityPoint | null = null;
  const serviceHours = policy.serviceMinutes / 60;

  for (let n = 1; n <= maxN; n++) {
    const lambda = serviceHours > 0 ? n / serviceHours : n;
    const wait = queueWaitMGS(lambda, serviceHours, 0.5, policy.capacityS);
    const utility = expectedUtility(n, policy, showProbability);
    const slaOk = wait <= policy.slaWaitMin;
    const point: UtilityPoint = { n, utility, wait: Number.isFinite(wait) ? wait : Number.POSITIVE_INFINITY, slaOk };
    utilities.push(point);

    if (slaOk && (best === null || utility > best.utility)) {
      best = point;
    }
  }

  if (!best) {
    best = utilities.find((point) => point.n === policy.capacityS) ?? utilities[0] ?? null;
  }

  return { utilities, best };
};

const buildFeatureVector = (
  slotStart: Date,
  policy: Policy,
  slotFeature?: Tables<"slot_features"> | null
): Record<string, number> => {
  const features: Record<string, number> = {
    hour_of_day: slotStart.getHours(),
    day_of_week: slotStart.getDay(),
    base_price: slotFeature?.base_price ?? policy.priceCents / 100,
    lead_hours: slotFeature?.lead_hours ?? 24,
    weather_temp: slotFeature?.weather_temp ?? 68,
    weather_precip: slotFeature?.weather_precip ?? 0,
    traffic_index: slotFeature?.traffic_index ?? 0,
    is_holiday: slotFeature?.is_holiday ? 1 : 0,
    is_school_break: slotFeature?.is_school_break ? 1 : 0,
  };

  return features;
};

const average = (values: number[]): number => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export interface OptimizeSummary {
  nStar: number;
  pBar: number;
  Wq: number;
  utilities: UtilityPoint[];
}

export const optimizeSlotForUser = async (
  userId: string,
  input: { slotStart: string }
): Promise<OptimizeSummary> => {
  const { slotStart } = OptimizeReq.parse(input);
  const policy = await getOrCreatePolicy(userId);
  const slotStartDate = new Date(slotStart);
  const slotEndDate = new Date(slotStartDate.getTime() + policy.serviceMinutes * 60 * 1000);

  const [appointmentsRes, modelRes, featureRes] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, starts_at, status")
      .eq("user_id", userId)
      .gte("starts_at", slotStartDate.toISOString())
      .lt("starts_at", slotEndDate.toISOString()),
    supabase
      .from("model_params")
      .select("baseline_show_prob, beta_coefficients")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("slot_features")
      .select("*")
      .eq("user_id", userId)
      .eq("slot_start", slotStartDate.toISOString())
      .maybeSingle(),
  ]);

  if (appointmentsRes.error) throw appointmentsRes.error;
  if (modelRes.error && modelRes.error.code !== "PGRST116") throw modelRes.error;
  if (featureRes.error && featureRes.error.code !== "PGRST116") throw featureRes.error;

  const appointments = (appointmentsRes.data ?? []).filter(
    (appt) => !appt.status || appt.status === "booked"
  );

  const baseline = clampProbability(modelRes.data?.baseline_show_prob ?? 0.75);
  const coefficients = (modelRes.data?.beta_coefficients as Record<string, number> | null) ?? null;
  const featureVector = buildFeatureVector(slotStartDate, policy, featureRes.data ?? undefined);

  const probabilities = appointments.map(() => phat(featureVector, coefficients, baseline));
  const pBar = clampProbability(probabilities.length ? average(probabilities) : baseline);

  const { utilities, best } = evaluateBookingLevels(policy, pBar);
  const nStar = best?.n ?? policy.capacityS;
  const Wq = best?.wait ?? 0;

  captureTelemetry("optimize_called", {
    slotStart,
    nStar,
    pBar,
    wait: Wq,
    slotsEvaluated: utilities.length,
  });

  return {
    nStar,
    pBar,
    Wq,
    utilities,
  };
};
