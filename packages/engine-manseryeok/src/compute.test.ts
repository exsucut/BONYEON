import { describe, expect, it } from "vitest";
import { compute } from "./compute.js";
import type { ManseryeokInput } from "./types.js";

function mkInput(overrides: Partial<ManseryeokInput> = {}): ManseryeokInput {
  return {
    date: { year: 1990, month: 12, day: 9 },
    time: { hour: 13, minute: 0 },
    calendarType: "solar",
    location: { longitude: 126.978, latitude: 37.5665, cityName: "서울" },
    conventions: {
      jasi: "unified",
      yearBoundary: "ipchun",
      useTrueSolarTime: false,
    },
    ...overrides,
  };
}

describe("compute — full pipeline", () => {
  it("runs end-to-end without throwing", () => {
    const out = compute(mkInput());
    expect(out.pillars.year).toBeDefined();
    expect(out.pillars.month).toBeDefined();
    expect(out.pillars.day).toBeDefined();
    expect(out.pillars.hour).toBeDefined();
  });

  it("returns all invariants (kongmang pairs, napeum strings, hidden stem sum=30)", () => {
    const out = compute(mkInput());
    expect(out.kongmang.byDay).toHaveLength(2);
    expect(out.kongmang.byYear).toHaveLength(2);
    expect(typeof out.napeum.year).toBe("string");
    for (const pillarKey of ["year", "month", "day", "hour"] as const) {
      const hs = out.hiddenStems[pillarKey];
      if (hs) {
        const total = hs.reduce((acc, h) => acc + h.days, 0);
        expect(total, `sum for ${pillarKey}`).toBe(30);
      }
    }
  });

  it("null time yields null hour pillar + null hour hidden stems + null hour napeum", () => {
    const out = compute(mkInput({ time: null }));
    expect(out.pillars.hour).toBeNull();
    expect(out.hiddenStems.hour).toBeNull();
    expect(out.napeum.hour).toBeNull();
  });

  it("1990-12-09 13:00 KST: 庚午年·戊子月·??日·??時 (연/월 검증)", () => {
    // 1990 = 庚午年. 12월은 대설 지나 子月. 庚 年 → 寅月 戊 (오호둔), 子=11번째 → 戊+10=戊(4+10=14 mod 10=4) 아니 잠깐.
    // 오호둔 乙·庚 연간: 寅月=戊, 卯月=己, 辰月=庚, 巳月=辛, 午月=壬, 未月=癸, 申月=甲, 酉月=乙, 戌月=丙, 亥月=丁, 子月=戊, 丑月=己.
    // 그러므로 庚午년 子月 = 戊子.
    const out = compute(mkInput());
    expect(out.pillars.year.stem.han).toBe("庚");
    expect(out.pillars.year.branch.han).toBe("午");
    expect(out.pillars.month.stem.han).toBe("戊");
    expect(out.pillars.month.branch.han).toBe("子");
  });

  it("2000-01-01 12:00 KST is 丁酉日 (reference anchor)", () => {
    const out = compute(
      mkInput({
        date: { year: 2000, month: 1, day: 1 },
        time: { hour: 12, minute: 0 },
      }),
    );
    expect(out.pillars.day.stem.han).toBe("丁");
    expect(out.pillars.day.branch.han).toBe("酉");
  });

  it("warnings surface for lunar input and unused true-solar-time", () => {
    const out = compute(
      mkInput({
        calendarType: "lunar",
        conventions: {
          jasi: "unified",
          yearBoundary: "ipchun",
          useTrueSolarTime: true,
        },
      }),
    );
    expect(out.trace.warnings.length).toBeGreaterThanOrEqual(2);
  });

  it("trace.solarTerms.previousMajor is a known 12節 name", () => {
    const out = compute(mkInput());
    const majorNames = [
      "입춘", "경칩", "청명", "입하", "망종", "소서",
      "입추", "백로", "한로", "입동", "대설", "소한",
    ];
    expect(majorNames).toContain(out.trace.solarTerms.previousMajor.name);
  });
});
