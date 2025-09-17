import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { z } from "zod";
import type { Policy } from "./types";
import { captureTelemetry } from "./telemetry";

export const DEFAULT_POLICY: Policy = {
  capacityS: 1,
  serviceMinutes: 30,
  priceCents: 8000,
  cOverCents: 4000,
  uUnderCents: 1000,
  slaWaitMin: 5,
  maxOverbook: 2,
};

const PolicySchema = z.object({
  capacityS: z.number().int().min(1),
  serviceMinutes: z.number().int().min(5),
  priceCents: z.number().int().nonnegative(),
  cOverCents: z.number().int().nonnegative(),
  uUnderCents: z.number().int().nonnegative(),
  slaWaitMin: z.number().int().nonnegative(),
  maxOverbook: z.number().int().min(0),
});

export type PolicyInput = z.infer<typeof PolicySchema>;

const rowToPolicy = (row: Tables<"user_policy">): Policy => ({
  capacityS: row.capacity_s,
  serviceMinutes: row.service_minutes,
  priceCents: row.price_cents,
  cOverCents: row.penalty_over_cents,
  uUnderCents: row.penalty_under_cents,
  slaWaitMin: row.sla_wait_minutes,
  maxOverbook: row.max_overbook,
});

const policyToRow = (userId: string, policy: Policy): TablesInsert<"user_policy"> => ({
  user_id: userId,
  capacity_s: policy.capacityS,
  service_minutes: policy.serviceMinutes,
  price_cents: policy.priceCents,
  penalty_over_cents: policy.cOverCents,
  penalty_under_cents: policy.uUnderCents,
  sla_wait_minutes: policy.slaWaitMin,
  max_overbook: policy.maxOverbook,
  updated_at: new Date().toISOString(),
});

export const getOrCreatePolicy = async (userId: string): Promise<Policy> => {
  const { data, error } = await supabase
    .from("user_policy")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  if (data) {
    return rowToPolicy(data);
  }

  const { data: inserted, error: insertError } = await supabase
    .from("user_policy")
    .insert(policyToRow(userId, DEFAULT_POLICY))
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return rowToPolicy(inserted);
};

export const savePolicy = async (userId: string, policy: PolicyInput): Promise<Policy> => {
  const parsed = PolicySchema.parse(policy);

  const { data, error } = await supabase
    .from("user_policy")
    .upsert(policyToRow(userId, parsed))
    .select()
    .single();

  if (error) {
    throw error;
  }

  captureTelemetry("policy_saved", {
    capacityS: parsed.capacityS,
    maxOverbook: parsed.maxOverbook,
    slaWaitMin: parsed.slaWaitMin,
  });

  return rowToPolicy(data);
};

export const ensurePolicy = async (userId: string): Promise<void> => {
  try {
    await getOrCreatePolicy(userId);
  } catch (error) {
    console.error("Failed to ensure user policy", error);
  }
};
