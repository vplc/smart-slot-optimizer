import { describe, expect, it } from "vitest";

import { expectedUtility } from "@/lib/math/expectedUtility";
import { phat, sigmoid } from "@/lib/math/logistic";
import { queueWaitMGS } from "@/lib/math/queueWait";

describe("expectedUtility", () => {
  it("increases as revenue per show increases", () => {
    const base = expectedUtility(4, 3, 10000, 2000, 4000, 0.6);
    const higher = expectedUtility(4, 3, 12000, 2000, 4000, 0.6);
    expect(higher).toBeGreaterThan(base);
  });

  it("responds to higher show probability", () => {
    const low = expectedUtility(4, 3, 10000, 2000, 4000, 0.4);
    const high = expectedUtility(4, 3, 10000, 2000, 4000, 0.7);
    expect(high).toBeGreaterThan(low);
  });
});

describe("logistic helpers", () => {
  it("produces values in (0,1)", () => {
    const value = phat({ bias: 0.2 }, { bias: 1 });
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThan(1);
  });

  it("sigmoid is monotonic", () => {
    expect(sigmoid(-2)).toBeLessThan(sigmoid(2));
  });
});

describe("queueWaitMGS", () => {
  it("returns infinity when utilization exceeds 1", () => {
    const wait = queueWaitMGS(10, 1, 0.5, 5);
    expect(wait).toBe(Number.POSITIVE_INFINITY);
  });

  it("returns finite wait for stable systems", () => {
    const wait = queueWaitMGS(2, 1, 0.5, 5);
    expect(wait).toBeGreaterThanOrEqual(0);
    expect(wait).not.toBe(Number.POSITIVE_INFINITY);
  });
});
