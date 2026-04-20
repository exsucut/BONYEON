import { describe, expect, it } from "vitest";
import { monthPillar } from "./month.js";

const kstToUtc = (y: number, m: number, d: number, h = 12, mn = 0) =>
  new Date(Date.UTC(y, m - 1, d, h - 9, mn));

describe("monthPillar — 오호둔", () => {
  // 1984 = 甲子年 (yearStem=0)
  // 甲·己 연간 → 寅月 丙. 1984 mid-January (before 입춘) → 丑月 (소한~입춘).
  // mid-Feb (past 입춘) → 寅月 = 丙寅.
  it("1984-02-15 (甲年·寅月) → 丙寅", () => {
    const r = monthPillar(kstToUtc(1984, 2, 15), 0);
    expect(r.pillar.stem.han).toBe("丙");
    expect(r.pillar.branch.han).toBe("寅");
    expect(r.governingTermName).toBe("입춘");
  });

  // 2024 = 甲辰年 (yearStem=0)
  // 2024-06-15 → 망종~소서 사이 = 午月. 甲·己 연 → 午月 庚 (오호둔).
  it("2024-06-15 (甲年·午月) → 庚午", () => {
    const r = monthPillar(kstToUtc(2024, 6, 15), 0);
    expect(r.pillar.stem.han).toBe("庚");
    expect(r.pillar.branch.han).toBe("午");
  });

  // 2000 = 庚辰年 (yearStem=6). 乙·庚 연간 → 寅月 戊.
  // 2000-03-15 → 경칩~청명 사이 = 卯月. 寅+1 = 己卯.
  it("2000-03-15 (庚年·卯月) → 己卯", () => {
    const r = monthPillar(kstToUtc(2000, 3, 15), 6);
    expect(r.pillar.stem.han).toBe("己");
    expect(r.pillar.branch.han).toBe("卯");
  });
});
