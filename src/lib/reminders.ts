import { supabase } from "@/integrations/supabase/client";
import { OutcomeReq } from "./validators";
import { captureTelemetry } from "./telemetry";

export type ReminderOutcomeInput = ReturnType<typeof OutcomeReq.parse>;

export const recordReminderOutcome = async (
  userId: string,
  input: ReminderOutcomeInput
) => {
  const payload = OutcomeReq.parse(input);

  const [banditRes, appointmentUpdate] = await Promise.all([
    supabase
      .from("reminder_bandit")
      .select("a, b")
      .eq("user_id", userId)
      .eq("variant", payload.variant)
      .maybeSingle(),
    supabase
      .from("appointments")
      .update({ status: payload.showed ? "showed" : "no_show" })
      .eq("id", payload.apptId)
      .eq("user_id", userId),
  ]);

  if (banditRes.error && banditRes.error.code !== "PGRST116") {
    throw banditRes.error;
  }

  if (appointmentUpdate.error) {
    throw appointmentUpdate.error;
  }

  const a = (banditRes.data?.a ?? 1) + (payload.showed ? 1 : 0);
  const b = (banditRes.data?.b ?? 1) + (payload.showed ? 0 : 1);

  const { data, error } = await supabase
    .from("reminder_bandit")
    .upsert({
      user_id: userId,
      variant: payload.variant,
      a,
      b,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  captureTelemetry("bandit_outcome_recorded", {
    variant: data.variant,
    showed: payload.showed,
  });

  return {
    variant: data.variant,
    a: data.a,
    b: data.b,
  };
};
