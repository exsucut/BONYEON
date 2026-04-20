import { describe, expect, it } from "vitest";
import { compute, WEEKS } from "./index.js";

describe("Goldschneider 48-week engine", () => {
  it("has exactly 48 week entries", () => {
    expect(WEEKS).toHaveLength(48);
    const ids = WEEKS.map((w) => w.id);
    expect(new Set(ids).size).toBe(48);
  });

  it("classifies every calendar day (non-leap) into a single week", () => {
    const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let total = 0;
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= (daysPerMonth[m - 1] ?? 0); d++) {
        const out = compute({ solarDate: { year: 2026, month: m, day: d } });
        expect(out.archetypeId).toBeGreaterThanOrEqual(1);
        expect(out.archetypeId).toBeLessThanOrEqual(48);
        total++;
      }
    }
    expect(total).toBe(365);
  });

  it("Feb 29 lands within pisces-i", () => {
    const out = compute({ solarDate: { year: 2024, month: 2, day: 29 } });
    expect(out.weekKey).toBe("pisces-i");
    expect(out.isCusp).toBe(false);
  });

  it("Jan 1 is in capricorn-i (year-crossing week)", () => {
    const out = compute({ solarDate: { year: 2026, month: 1, day: 1 } });
    expect(out.weekKey).toBe("capricorn-i");
  });

  it("Dec 31 is in capricorn-i", () => {
    const out = compute({ solarDate: { year: 2026, month: 12, day: 31 } });
    expect(out.weekKey).toBe("capricorn-i");
  });

  it("Mar 21 is in pisces-aries-cusp (vernal equinox)", () => {
    const out = compute({ solarDate: { year: 2026, month: 3, day: 21 } });
    expect(out.isCusp).toBe(true);
    expect(out.cuspDetail?.previousSign).toBe("pisces");
    expect(out.cuspDetail?.nextSign).toBe("aries");
  });

  it("Dec 9 (demo input) lands within sagittarius-ii", () => {
    const out = compute({ solarDate: { year: 1990, month: 12, day: 9 } });
    expect(out.weekKey).toBe("sagittarius-ii");
    expect(out.nameKo).toBe("광대한 궤적");
    expect(out.sunSign).toBe("sagittarius");
    expect(out.decanate).toBe(2);
    expect(out.isCusp).toBe(false);
  });

  it("cusp entries carry cuspDetail", () => {
    const cusps = WEEKS.filter((w) => w.isCusp);
    expect(cusps.length).toBe(12);
    for (const c of cusps) {
      // pick any day in its range
      const out = compute({
        solarDate: { year: 2026, month: c.startMonth, day: c.startDay },
      });
      expect(out.isCusp).toBe(true);
      expect(out.cuspDetail).not.toBeNull();
    }
  });
});
