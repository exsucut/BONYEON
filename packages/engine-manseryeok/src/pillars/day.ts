// 일주 — JDN 기반.
// docs/10-engine-manseryeok-spec-v0.1.md §7.3
//
// 기준 앵커: 2000-01-01 = 丁酉日 (stem=3, branch=9, JDN 2451545).

import { getBranch } from "../constants/branches.js";
import { getStem } from "../constants/stems.js";
import { jdnFromCivilDate } from "../julian.js";
import type { Pillar } from "../types.js";

const REF_JDN = 2451545; // 2000-01-01
const REF_STEM = 3; // 丁
const REF_BRANCH = 9; // 酉

export interface DayPillarResult {
  readonly pillar: Pillar;
  readonly jdn: number;
  readonly civilDate: { year: number; month: number; day: number };
}

/**
 * Compute day pillar from a *civil date* (already adjusted for any 자시 roll-forward).
 * The caller is responsible for applying jasi convention — this function just reads
 * the date and returns the pillar based on JDN offset.
 */
export function dayPillarForCivilDate(
  year: number,
  month: number,
  day: number,
): DayPillarResult {
  const jdn = jdnFromCivilDate(year, month, day);
  const delta = jdn - REF_JDN;
  const stemIndex = (((delta + REF_STEM) % 10) + 10) % 10;
  const branchIndex = (((delta + REF_BRANCH) % 12) + 12) % 12;

  return {
    pillar: { stem: getStem(stemIndex), branch: getBranch(branchIndex) },
    jdn,
    civilDate: { year, month, day },
  };
}
