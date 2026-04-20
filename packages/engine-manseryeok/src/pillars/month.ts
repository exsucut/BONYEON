// 월주 — 12節 + 오호둔.
// docs/10-engine-manseryeok-spec-v0.1.md §7.2, §부록C

import { getBranch } from "../constants/branches.js";
import { getStem } from "../constants/stems.js";
import { findBracketingMajorTerms } from "../solar-terms.js";
import type { Pillar } from "../types.js";

export interface MonthPillarResult {
  readonly pillar: Pillar;
  readonly governingTermName: string;
  readonly monthBranchIndex: number;
  readonly wuhutunRule: string;
}

// 월지 순서: 입춘부터 시작하여 寅(2), 卯(3), ..., 丑(1).
// 12節의 황경 → 월지 index.
const TERM_LONGITUDE_TO_BRANCH: Record<number, number> = {
  315: 2, // 입춘 → 寅
  345: 3, // 경칩 → 卯
  15: 4, // 청명 → 辰
  45: 5, // 입하 → 巳
  75: 6, // 망종 → 午
  105: 7, // 소서 → 未
  135: 8, // 입추 → 申
  165: 9, // 백로 → 酉
  195: 10, // 한로 → 戌
  225: 11, // 입동 → 亥
  255: 0, // 대설 → 子
  285: 1, // 소한 → 丑
};

export function monthPillar(birthUtc: Date, yearStemIndex: number): MonthPillarResult {
  const { previous } = findBracketingMajorTerms(birthUtc);
  const monthBranchIndex = TERM_LONGITUDE_TO_BRANCH[previous.longitude];
  if (monthBranchIndex === undefined) {
    throw new Error(
      `Unexpected term longitude for month: ${String(previous.longitude)} (${previous.name})`,
    );
  }

  // 오호둔: 연간에 따라 寅月(branch=2)의 간 결정.
  //   甲·己 → 丙(2), 乙·庚 → 戊(4), 丙·辛 → 庚(6), 丁·壬 → 壬(8), 戊·癸 → 甲(0)
  const WUHUTUN_YIN_STEM: readonly number[] = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
  const yinStem = WUHUTUN_YIN_STEM[yearStemIndex];
  if (yinStem === undefined) {
    throw new Error(`Invalid yearStemIndex: ${String(yearStemIndex)}`);
  }
  const offsetFromYin = (monthBranchIndex - 2 + 12) % 12;
  const monthStemIndex = (yinStem + offsetFromYin) % 10;

  const yinPairLabels = ["甲·己", "乙·庚", "丙·辛", "丁·壬", "戊·癸"];
  const pairIdx = yearStemIndex % 5;
  const yinStemHan = getStem(yinStem).han;

  return {
    pillar: {
      stem: getStem(monthStemIndex),
      branch: getBranch(monthBranchIndex),
    },
    governingTermName: previous.name,
    monthBranchIndex,
    wuhutunRule: `${yinPairLabels[pairIdx]} → 寅月 ${yinStemHan}`,
  };
}
