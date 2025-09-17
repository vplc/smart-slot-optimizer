import { describe, expect, it } from "vitest";
import { expectedUtility, evaluateBookingLevels } from "@/lib/optimizer";
import type { Policy } from "@/lib/types";

const basePolicy: Policy = {
  capacityS: 1,
  serviceMinutes: 30,
  priceCents: 8000,
  cOverCents: 4000,
  uUnderCents: 1000,
  slaWaitMin: 5,
  maxOverbook: 2,
};

describe("optimizer utility", () => {
  it("increases when price improves", () => {
    const richer: Policy = { ...basePolicy, priceCents: 12000 };
    const baseline = expectedUtility(2, basePolicy, 0.8);
    const upgraded = expectedUtility(2, richer, 0.8);

    expect(upgraded).toBeGreaterThan(baseline);
  });

  it("penalizes overtime when costs spike", () => {
    const harsh: Policy = { ...basePolicy, cOverCents: 9000 };
    const friendly: Policy = { ...basePolicy, cOverCents: 1000 };

    const withHarshPenalty = expectedUtility(2, harsh, 0.8);
    const withFriendlyPenalty = expectedUtility(2, friendly, 0.8);

    expect(withHarshPenalty).toBeLessThan(withFriendlyPenalty);
  });

  it("rejects aggressive overbooking when service is long", () => {
    const slowService: Policy = {
      ...basePolicy,
      serviceMinutes: 120,
      maxOverbook: 3,
      slaWaitMin: 5,
    };

    const { best, utilities } = evaluateBookingLevels(slowService, 0.8);

    expect(best?.n).toBe(1);
    const anyOverbook = utilities.find((entry) => entry.n > 1);
    expect(anyOverbook?.slaOk).toBe(false);
  });
});
