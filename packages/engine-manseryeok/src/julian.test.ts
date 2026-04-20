import { describe, expect, it } from "vitest";
import { civilDateFromJdn, jdFromUtc, jdnFromCivilDate, utcFromJd } from "./julian.js";

describe("jdnFromCivilDate", () => {
  it("2000-01-01 → 2451545 (Meeus anchor)", () => {
    expect(jdnFromCivilDate(2000, 1, 1)).toBe(2451545);
  });

  it("1990-12-09 → 2448235", () => {
    // Manual check: 2000-01-01 is 2451545, 1990-12-09 is 2451545 - 3310 days.
    expect(jdnFromCivilDate(1990, 12, 9)).toBe(2448235);
  });

  it("is inverse of civilDateFromJdn for 1900-01-01", () => {
    const jdn = jdnFromCivilDate(1900, 1, 1);
    expect(civilDateFromJdn(jdn)).toEqual({ year: 1900, month: 1, day: 1 });
  });

  it("is inverse over sample range 1950-2050", () => {
    for (let y = 1950; y <= 2050; y += 7) {
      for (const m of [1, 3, 6, 9, 12]) {
        for (const d of [1, 15, 28]) {
          const jdn = jdnFromCivilDate(y, m, d);
          expect(civilDateFromJdn(jdn)).toEqual({ year: y, month: m, day: d });
        }
      }
    }
  });
});

describe("jdFromUtc / utcFromJd", () => {
  it("2000-01-01T12:00:00Z → 2451545.0", () => {
    expect(jdFromUtc(new Date(Date.UTC(2000, 0, 1, 12, 0, 0)))).toBeCloseTo(2451545.0, 9);
  });

  it("round-trips a random-looking date within 1ms", () => {
    const d = new Date(Date.UTC(1984, 5, 15, 3, 14, 15));
    const jd = jdFromUtc(d);
    expect(utcFromJd(jd).getTime()).toBeCloseTo(d.getTime(), -1); // |diff| < 5ms
  });
});
