import { describe, expect, it } from "vitest";
import {
  findBracketingMajorTerms,
  findSolarTermUtc,
  solarLongitude,
  solarLongitudeAtUtc,
} from "./solar-terms.js";
import { jdFromUtc } from "./julian.js";

describe("solarLongitude", () => {
  it("returns a value in [0, 360) for 2000-01-01", () => {
    const L = solarLongitude(2451545.0);
    expect(L).toBeGreaterThanOrEqual(0);
    expect(L).toBeLessThan(360);
    // Sun should be near longitude 280° at Jan 1
    expect(L).toBeGreaterThan(279);
    expect(L).toBeLessThan(281);
  });

  it("increases monotonically within a short window", () => {
    const base = jdFromUtc(new Date(Date.UTC(2024, 5, 1)));
    const a = solarLongitude(base);
    const b = solarLongitude(base + 7); // +7 days
    expect(b).toBeGreaterThan(a);
    // ~7 * 0.986 = ~6.9 degrees
    expect(b - a).toBeGreaterThan(6);
    expect(b - a).toBeLessThan(8);
  });
});

describe("findSolarTermUtc", () => {
  // Known reference: 입춘 2000-02-04 20:40 UTC (approx)
  // KASI: 2000-02-04 20:40:44 UTC (but our Meeus low-precision ±1 minute)
  it("입춘 2000 is within Feb 4, ±1 day of nominal", () => {
    const ipchun = findSolarTermUtc(2000, 315);
    expect(ipchun.getUTCFullYear()).toBe(2000);
    expect(ipchun.getUTCMonth()).toBe(1); // February
    expect(ipchun.getUTCDate()).toBeGreaterThanOrEqual(3);
    expect(ipchun.getUTCDate()).toBeLessThanOrEqual(5);
  });

  it("입춘 2024 is within Feb 4, ±1 day", () => {
    const ipchun = findSolarTermUtc(2024, 315);
    expect(ipchun.getUTCMonth()).toBe(1);
    expect(ipchun.getUTCDate()).toBeGreaterThanOrEqual(3);
    expect(ipchun.getUTCDate()).toBeLessThanOrEqual(5);
  });

  it("하지 2024 is within Jun 20-22", () => {
    const hajimi = findSolarTermUtc(2024, 90);
    expect(hajimi.getUTCMonth()).toBe(5); // June
    expect(hajimi.getUTCDate()).toBeGreaterThanOrEqual(19);
    expect(hajimi.getUTCDate()).toBeLessThanOrEqual(22);
  });

  it("solar longitude at the computed UTC is within 0.01 deg of target", () => {
    const target = 135;
    const utc = findSolarTermUtc(2024, target);
    const L = solarLongitudeAtUtc(utc);
    expect(Math.abs(L - target)).toBeLessThan(0.01);
  });
});

describe("findBracketingMajorTerms", () => {
  it("surrounds a mid-year date", () => {
    const utc = new Date(Date.UTC(2024, 7, 20)); // August 20
    const { previous, next } = findBracketingMajorTerms(utc);
    expect(previous.utc.getTime()).toBeLessThanOrEqual(utc.getTime());
    expect(next.utc.getTime()).toBeGreaterThan(utc.getTime());
    // Around Aug 20: previous is 입추 (Aug 7-ish), next is 백로 (Sep 7-ish)
    expect(previous.name).toBe("입추");
    expect(next.name).toBe("백로");
  });

  it("previous/next are adjacent major terms (15° apart except wrap)", () => {
    const utc = new Date(Date.UTC(2024, 0, 15));
    const { previous, next } = findBracketingMajorTerms(utc);
    const diff = (next.longitude - previous.longitude + 360) % 360;
    expect(diff).toBe(30); // major terms are 30° apart
  });
});
