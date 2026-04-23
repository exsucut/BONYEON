import { describe, expect, it } from "vitest";
import { ARROWS, compute, INSTRUMENT_VERSION, ITEMS, TYPE_NAMES, WING_NEIGHBORS } from "./index.js";
import type { EnneaType, LikertValue } from "./index.js";

function allItemsAtValue(v: LikertValue) {
  return ITEMS.map((i) => ({ questionId: i.id, value: v }));
}

function favoringType(target: EnneaType) {
  // Answer 7 for target type items, 1 for others
  return ITEMS.map((i) => ({
    questionId: i.id,
    value: (i.type === target ? 7 : 1) as LikertValue,
  }));
}

describe("Enneagram engine", () => {
  it("has 18 items (9 types × 2)", () => {
    expect(ITEMS).toHaveLength(18);
    for (const t of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
      expect(ITEMS.filter((i) => i.type === t)).toHaveLength(2);
    }
  });

  it("favoring any given type resolves to that primary type", () => {
    for (const t of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
      const out = compute({
        answers: favoringType(t),
        instrumentVersion: INSTRUMENT_VERSION,
      });
      expect(out.primaryType, `target ${String(t)}`).toBe(t);
      expect(out.typeScores[t]).toBe(100);
    }
  });

  it("all-neutral (4) produces too_neutral flag", () => {
    const out = compute({
      answers: allItemsAtValue(4),
      instrumentVersion: INSTRUMENT_VERSION,
    });
    expect(out.reliability.flags).toContain("too_neutral");
    for (const t of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
      expect(out.typeScores[t]).toBe(50);
    }
  });

  it("wing is a neighbor of primary", () => {
    const out = compute({
      answers: favoringType(5),
      instrumentVersion: INSTRUMENT_VERSION,
    });
    expect(out.primaryType).toBe(5);
    const neighbors = WING_NEIGHBORS[5];
    if (out.wing.type !== null) {
      expect(neighbors).toContain(out.wing.type);
    }
  });

  it("triad dominant matches primary type group", () => {
    const cases: Array<[EnneaType, "body" | "heart" | "head"]> = [
      [1, "body"], [8, "body"], [9, "body"],
      [2, "heart"], [3, "heart"], [4, "heart"],
      [5, "head"], [6, "head"], [7, "head"],
    ];
    for (const [t, expected] of cases) {
      const out = compute({
        answers: favoringType(t),
        instrumentVersion: INSTRUMENT_VERSION,
      });
      expect(out.triad.dominant, `type ${String(t)}`).toBe(expected);
    }
  });

  it("arrows match canonical table", () => {
    for (const t of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
      const out = compute({
        answers: favoringType(t),
        instrumentVersion: INSTRUMENT_VERSION,
      });
      expect(out.arrows.integrationTo).toBe(ARROWS[t].integration);
      expect(out.arrows.disintegrationTo).toBe(ARROWS[t].disintegration);
    }
  });

  it("incomplete answers trigger 'incomplete' flag", () => {
    const partial = ITEMS.slice(0, 4).map((i) => ({
      questionId: i.id,
      value: 7 as LikertValue,
    }));
    const out = compute({
      answers: partial,
      instrumentVersion: INSTRUMENT_VERSION,
    });
    expect(out.reliability.flags).toContain("incomplete");
    expect(out.reliability.completion).toBeCloseTo(4 / 18, 3);
  });

  it("all type names are populated", () => {
    for (const t of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
      expect(TYPE_NAMES[t].kr.length).toBeGreaterThan(0);
      expect(TYPE_NAMES[t].en.length).toBeGreaterThan(0);
    }
  });

  it("orderedTypes sorted by descending score", () => {
    const out = compute({
      answers: favoringType(3),
      instrumentVersion: INSTRUMENT_VERSION,
    });
    for (let i = 0; i < out.orderedTypes.length - 1; i++) {
      expect(out.orderedTypes[i]!.score).toBeGreaterThanOrEqual(
        out.orderedTypes[i + 1]!.score,
      );
    }
  });
});
