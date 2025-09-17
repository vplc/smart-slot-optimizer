import { z } from "zod";

export const OptimizeReq = z.object({
  slotStart: z.string().datetime(),
});

export const OutcomeReq = z.object({
  apptId: z.string().uuid(),
  showed: z.boolean(),
  variant: z.enum(["T-24", "T-6", "T-2"]),
});

export const ICSReq = z.object({ url: z.string().url() });
