import { describe, expect, it } from "vitest";
import { dayPillarForCivilDate } from "./day.js";

describe("dayPillarForCivilDate", () => {
  it("reference anchor 2000-01-01 = 丁酉", () => {
    const r = dayPillarForCivilDate(2000, 1, 1);
    expect(r.pillar.stem.han).toBe("丁");
    expect(r.pillar.branch.han).toBe("酉");
    expect(r.jdn).toBe(2451545);
  });

  it("2000-01-02 = 戊戌 (next in sexagenary)", () => {
    const r = dayPillarForCivilDate(2000, 1, 2);
    expect(r.pillar.stem.han).toBe("戊");
    expect(r.pillar.branch.han).toBe("戌");
  });

  it("1999-12-31 = 丙申 (previous)", () => {
    const r = dayPillarForCivilDate(1999, 12, 31);
    expect(r.pillar.stem.han).toBe("丙");
    expect(r.pillar.branch.han).toBe("申");
  });

  it("cycles every 60 days", () => {
    const a = dayPillarForCivilDate(2000, 1, 1);
    const b = dayPillarForCivilDate(2000, 3, 1); // +60 days
    expect(b.pillar.stem.index).toBe(a.pillar.stem.index);
    expect(b.pillar.branch.index).toBe(a.pillar.branch.index);
  });
});
