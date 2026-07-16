import { describe, it, expect } from "vitest";
import { computeSm2Update, SM2_INITIAL_STATE } from "./sm2";

describe("computeSm2Update", () => {
  it("schedules a first-time perfect recall (quality 5) for tomorrow", () => {
    const result = computeSm2Update(5, SM2_INITIAL_STATE, new Date("2026-01-01T00:00:00Z"));
    expect(result.repetitions).toBe(1);
    expect(result.intervalDays).toBe(1);
    expect(result.nextReviewAt.toISOString()).toBe("2026-01-02T00:00:00.000Z");
  });

  it("schedules the second consecutive success 6 days out", () => {
    const afterFirst = computeSm2Update(5, SM2_INITIAL_STATE, new Date("2026-01-01T00:00:00Z"));
    const afterSecond = computeSm2Update(5, afterFirst, new Date("2026-01-02T00:00:00Z"));
    expect(afterSecond.repetitions).toBe(2);
    expect(afterSecond.intervalDays).toBe(6);
  });

  it("grows the interval multiplicatively on the third-plus consecutive success", () => {
    let state = computeSm2Update(5, SM2_INITIAL_STATE, new Date("2026-01-01T00:00:00Z"));
    state = computeSm2Update(5, state, new Date("2026-01-02T00:00:00Z"));
    const third = computeSm2Update(5, state, new Date("2026-01-08T00:00:00Z"));
    // interval should be roughly intervalDays(6) * easinessFactor, rounded
    expect(third.intervalDays).toBeGreaterThan(6);
    expect(third.repetitions).toBe(3);
  });

  it("resets repetitions and interval to 1 on a failed recall (quality < 3)", () => {
    let state = computeSm2Update(5, SM2_INITIAL_STATE, new Date("2026-01-01T00:00:00Z"));
    state = computeSm2Update(5, state, new Date("2026-01-02T00:00:00Z"));
    const failed = computeSm2Update(1, state, new Date("2026-01-08T00:00:00Z"));
    expect(failed.repetitions).toBe(0);
    expect(failed.intervalDays).toBe(1);
  });

  it("never lets the easiness factor drop below 1.3 even with repeated failures", () => {
    let state = SM2_INITIAL_STATE;
    for (let i = 0; i < 20; i++) {
      state = computeSm2Update(0, state, new Date("2026-01-01T00:00:00Z"));
    }
    expect(state.easinessFactor).toBeCloseTo(1.3, 5);
    expect(state.easinessFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("increases the easiness factor on perfect recall (quality 5)", () => {
    const result = computeSm2Update(5, SM2_INITIAL_STATE, new Date("2026-01-01T00:00:00Z"));
    expect(result.easinessFactor).toBeGreaterThan(SM2_INITIAL_STATE.easinessFactor);
  });

  it("throws on an out-of-range quality value", () => {
    expect(() => computeSm2Update(6, SM2_INITIAL_STATE)).toThrow();
    expect(() => computeSm2Update(-1, SM2_INITIAL_STATE)).toThrow();
  });

  it("computes nextReviewAt as exactly intervalDays after the reference time", () => {
    const now = new Date("2026-03-15T12:00:00Z");
    const result = computeSm2Update(4, { easinessFactor: 2.5, intervalDays: 6, repetitions: 2 }, now);
    const expectedMs = now.getTime() + result.intervalDays * 24 * 60 * 60 * 1000;
    expect(result.nextReviewAt.getTime()).toBe(expectedMs);
  });
});
