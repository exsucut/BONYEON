// 연주 — 입춘 기준.
// docs/10-engine-manseryeok-spec-v0.1.md §7.1
//
// 연간 기준점: 1984년 = 甲子年 (stem=0, branch=0)

import { getBranch } from "../constants/branches.js";
import { getStem } from "../constants/stems.js";
import { findSolarTermUtc } from "../solar-terms.js";
import type { Pillar } from "../types.js";

export interface YearPillarResult {
  readonly pillar: Pillar;
  readonly ipchunUtc: Date;
  readonly birthRelativeToIpchun: "before" | "after";
  readonly effectiveYear: number;
}

export function yearPillar(birthUtc: Date): YearPillarResult {
  const calendarYear = birthUtc.getUTCFullYear();
  const ipchunThisYear = findSolarTermUtc(calendarYear, 315);
  const effectiveYear =
    birthUtc.getTime() < ipchunThisYear.getTime() ? calendarYear - 1 : calendarYear;

  const stemIndex = ((effectiveYear - 1984) % 10 + 10) % 10;
  const branchIndex = ((effectiveYear - 1984) % 12 + 12) % 12;

  return {
    pillar: { stem: getStem(stemIndex), branch: getBranch(branchIndex) },
    ipchunUtc: ipchunThisYear,
    birthRelativeToIpchun:
      birthUtc.getTime() < ipchunThisYear.getTime() ? "before" : "after",
    effectiveYear,
  };
}
