import { describe, expect, it } from "vitest";
import { hourPillar } from "./hour.js";

describe("hourPillar — 오서둔", () => {
  // 甲日 → 甲子時. 12:00 = 午時. 甲+7 = 辛. 午지.
  it("甲日 12:00 (unified) → 庚午", () => {
    // 오서둔: 甲日 子時 = 甲子(0). 午時 branch=6. stem = (0 + 6) % 10 = 6 = 庚.
    const r = hourPillar(12, 0, 0, "unified");
    expect(r.pillar.stem.han).toBe("庚");
    expect(r.pillar.branch.han).toBe("午");
    expect(r.civilDateShift).toBe(0);
  });

  it("甲日 23:30 (unified) → civilDateShift=1, 乙日 子時 = 丙子", () => {
    const r = hourPillar(23, 30, 0, "unified");
    expect(r.hourBranchIndex).toBe(0); // 子
    expect(r.civilDateShift).toBe(1);
    // NOTE: 여기서의 stem 계산은 provisional day stem=0(甲) 기준.
    // 실제 orchestrator는 shift 후 day stem을 재계산해 다시 호출한다.
    expect(r.pillar.stem.han).toBe("甲");
    expect(r.pillar.branch.han).toBe("子");
  });

  it("己日 00:30 (unified) → 甲子時", () => {
    // 己日(stem=5) → 子時 간 = 甲(0). 00시 = 子時.
    const r = hourPillar(0, 30, 5, "unified");
    expect(r.pillar.stem.han).toBe("甲");
    expect(r.pillar.branch.han).toBe("子");
    expect(r.civilDateShift).toBe(0);
  });

  it("standard hour-to-branch mapping", () => {
    const cases: ReadonlyArray<[number, string]> = [
      [1, "丑"],
      [3, "寅"],
      [5, "卯"],
      [7, "辰"],
      [9, "巳"],
      [11, "午"],
      [13, "未"],
      [15, "申"],
      [17, "酉"],
      [19, "戌"],
      [21, "亥"],
    ];
    for (const [h, branch] of cases) {
      const r = hourPillar(h, 0, 0, "unified");
      expect(r.pillar.branch.han, `hour=${String(h)}`).toBe(branch);
    }
  });
});
