import { describe, expect, it } from "vitest";
import { yearPillar } from "./year.js";

const kstToUtc = (y: number, m: number, d: number, h = 12, mn = 0) =>
  new Date(Date.UTC(y, m - 1, d, h - 9, mn)); // subtract 9h for KST→UTC (negative hour wraps)

describe("yearPillar", () => {
  it("1984 → 甲子年 (reference anchor)", () => {
    const r = yearPillar(kstToUtc(1984, 6, 15)); // mid-year, past 입춘
    expect(r.effectiveYear).toBe(1984);
    expect(r.pillar.stem.han).toBe("甲");
    expect(r.pillar.branch.han).toBe("子");
  });

  it("2000 → 庚辰年 (mid-year)", () => {
    const r = yearPillar(kstToUtc(2000, 6, 15));
    expect(r.effectiveYear).toBe(2000);
    expect(r.pillar.stem.han).toBe("庚");
    expect(r.pillar.branch.han).toBe("辰");
  });

  it("2024-01-15 (before 입춘) → 癸卯年 (previous year)", () => {
    const r = yearPillar(kstToUtc(2024, 1, 15));
    expect(r.effectiveYear).toBe(2023);
    expect(r.birthRelativeToIpchun).toBe("before");
    expect(r.pillar.stem.han).toBe("癸");
    expect(r.pillar.branch.han).toBe("卯");
  });

  it("2024-03-15 (after 입춘) → 甲辰年", () => {
    const r = yearPillar(kstToUtc(2024, 3, 15));
    expect(r.effectiveYear).toBe(2024);
    expect(r.birthRelativeToIpchun).toBe("after");
    expect(r.pillar.stem.han).toBe("甲");
    expect(r.pillar.branch.han).toBe("辰");
  });

  it("cycles with period 60", () => {
    const a = yearPillar(kstToUtc(1984, 6, 1));
    const b = yearPillar(kstToUtc(2044, 6, 1));
    expect(b.pillar.stem.index).toBe(a.pillar.stem.index);
    expect(b.pillar.branch.index).toBe(a.pillar.branch.index);
  });
});
