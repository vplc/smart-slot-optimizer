export type ReminderVariant = "T-24" | "T-6" | "T-2";

export interface OptimizePayload {
  slotStart: string;
  capacityS: number;
  priceCents: number;
  penalties: {
    over: number;
    under: number;
  };
  bookedClientIds: string[];
  slaMinutes?: number;
  slotMinutes?: number;
}

export interface OptimizeResult {
  n_star: number;
  expected_utility: number;
  p_bar: number;
  Wq: number;
}

export interface SlotFeature {
  user_id: string;
  slot_start: string;
  dow: number | null;
  hour: number | null;
  lead_hours: number | null;
  weather_temp: number | null;
  weather_precip: number | null;
  traffic_idx: number | null;
  school_break: boolean | null;
  holiday: boolean | null;
}

export interface PolicySettings {
  revenuePerShowCents: number;
  overPenaltyCents: number;
  underPenaltyCents: number;
  slaMinutes: number;
  maxOverbook: number;
}
