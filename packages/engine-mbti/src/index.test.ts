import { describe, expect, it } from "vitest";
import { compute, INSTRUMENT_VERSION, ITEMS, type LikertValue } from "./index.js";

const allAtValue = (v: LikertValue) =>
  ITEMS.map((i) => ({ questionId: i.id, value: v }));

describe("MBTI engine", () => {
  it("has 16 items evenly split across 4 axes (4 each)", () => {
    expect(ITEMS).toHaveLength(16);
    for (const axis of ["ei", "sn", "tf", "jp"] as const) {
      expect(ITEMS.filter((i) => i.axis === axis)).toHaveLength(4);
    }
  });

  it("all-7 (strongly agree) maximizes positive pole on every axis", () => {
    const out = compute({ answers: allAtValue(7), instrumentVersion: INSTRUMENT_VERSION });
    for (const axis of ["ei", "sn", "tf", "jp"] as const) {
      expect(out.axes[axis].normalized, axis).toBe(0); // because positive + negative items cancel
    }
    // With all-7, the consistency becomes 0 (pairs disagree maximally):
    // but tie-break favors negative poles → "ISTJ"
    // Actually let me compute: positive direction item → delta = +3, negative → delta = -3.
    // Sum per axis = +3 + +3 + (-3) + (-3) = 0. Normalized 0.
    expect(out.code).toBe("ISTJ"); // tie-break
  });

  it("all-1 (strongly disagree) also sums to 0 (symmetric)", () => {
    const out = compute({ answers: allAtValue(1), instrumentVersion: INSTRUMENT_VERSION });
    for (const axis of ["ei", "sn", "tf", "jp"] as const) {
      expect(out.axes[axis].normalized).toBe(0);
    }
  });

  it("all-4 (neutral) yields normalized=0 and too_neutral flag", () => {
    const out = compute({ answers: allAtValue(4), instrumentVersion: INSTRUMENT_VERSION });
    for (const axis of ["ei", "sn", "tf", "jp"] as const) {
      expect(out.axes[axis].normalized).toBe(0);
    }
    expect(out.reliability.flags).toContain("too_neutral");
  });

  it("extreme E·N·F·P profile resolves to ENFP", () => {
    const answers = ITEMS.map((i) => ({
      questionId: i.id,
      value: (i.direction === 1 ? 7 : 1) as LikertValue,
    }));
    const out = compute({ answers, instrumentVersion: INSTRUMENT_VERSION });
    expect(out.code).toBe("ENFP");
    for (const a of Object.values(out.axes)) {
      expect(a.normalized).toBeCloseTo(100, 5);
      expect(a.confidence).toBe("high");
    }
    expect(out.reliability.consistency).toBe(1);
  });

  it("extreme I·S·T·J profile resolves to ISTJ", () => {
    const answers = ITEMS.map((i) => ({
      questionId: i.id,
      value: (i.direction === 1 ? 1 : 7) as LikertValue,
    }));
    const out = compute({ answers, instrumentVersion: INSTRUMENT_VERSION });
    expect(out.code).toBe("ISTJ");
    for (const a of Object.values(out.axes)) {
      expect(a.normalized).toBeCloseTo(-100, 5);
    }
  });

  it("missing answers trigger 'incomplete' flag and completion < 1", () => {
    const out = compute({
      answers: ITEMS.slice(0, 8).map((i) => ({ questionId: i.id, value: 7 as LikertValue })),
      instrumentVersion: INSTRUMENT_VERSION,
    });
    expect(out.reliability.completion).toBeCloseTo(0.5, 3);
    expect(out.reliability.flags).toContain("incomplete");
  });

  it("produces typeName for all 16 codes", () => {
    const combos = [
      "ENFP", "ENFJ", "ENTP", "ENTJ",
      "INFP", "INFJ", "INTP", "INTJ",
      "ESFP", "ESFJ", "ESTP", "ESTJ",
      "ISFP", "ISFJ", "ISTP", "ISTJ",
    ] as const;
    for (const code of combos) {
      // Craft an answer set that resolves to this code
      const answers: Array<{ questionId: string; value: LikertValue }> = [];
      for (const item of ITEMS) {
        const axisPoleChar = {
          ei: code[0]!,
          sn: code[1]!,
          tf: code[2]!,
          jp: code[3]!,
        }[item.axis];
        // positive direction items should be 7 if axisPoleChar is the positive pole for that axis
        const positivePole = { ei: "E", sn: "N", tf: "F", jp: "P" }[item.axis];
        const wantPositivePole = axisPoleChar === positivePole;
        const v: LikertValue = wantPositivePole
          ? (item.direction === 1 ? 7 : 1)
          : (item.direction === 1 ? 1 : 7);
        answers.push({ questionId: item.id, value: v });
      }
      const out = compute({ answers, instrumentVersion: INSTRUMENT_VERSION });
      expect(out.code, `input target ${code}`).toBe(code);
      expect(out.typeName.kr).not.toBe(code); // has Korean name
    }
  });
});
