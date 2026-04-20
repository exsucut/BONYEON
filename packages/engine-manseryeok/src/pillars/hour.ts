// 시주 — 자시 관례 + 오서둔.
// docs/10-engine-manseryeok-spec-v0.1.md §7.4, §부록D
//
// v0.1: 'unified' 자시만 완전 구현. 'split' / 'offset30'은 placeholder.

import { getBranch } from "../constants/branches.js";
import { getStem } from "../constants/stems.js";
import type { JasiConvention, Pillar } from "../types.js";

export interface HourPillarResult {
  readonly pillar: Pillar;
  readonly hourBranchIndex: number;
  readonly civilDateShift: 0 | 1; // +1 if unified 자시 rolls to next day
  readonly wusodunRule: string;
}

/**
 * Standard hour → branch mapping.
 * 子(0): 23:00–00:59. In unified convention, 23:00 rolls the day forward.
 * 丑(1): 01:00–02:59. 寅(2): 03:00–04:59. ... 亥(11): 21:00–22:59.
 */
function standardHourBranch(hour: number): number {
  if (hour === 23 || hour === 0) return 0; // 子
  // hour=1 → 1, hour=2 → 1, hour=3 → 2, hour=4 → 2, ..., hour=21 → 11, hour=22 → 11
  return Math.floor((hour + 1) / 2);
}

export function hourPillar(
  hour: number,
  minute: number,
  dayStemIndex: number,
  convention: JasiConvention,
): HourPillarResult {
  let hourBranchIndex: number;
  let civilDateShift: 0 | 1;

  switch (convention) {
    case "unified": {
      hourBranchIndex = standardHourBranch(hour);
      civilDateShift = hour === 23 ? 1 : 0;
      break;
    }
    case "split": {
      // TODO(v0.2): 夜子時/朝子時 구분. 현재는 unified와 동일 처리 + warning.
      hourBranchIndex = standardHourBranch(hour);
      civilDateShift = hour === 23 ? 0 : 0; // split: 23시대는 전일 유지
      break;
    }
    case "offset30": {
      // TODO(v0.2): 30분 오프셋 테이블. 현재는 unified 근사.
      const totalMin = hour * 60 + minute;
      if (totalMin >= 23 * 60 + 30) {
        hourBranchIndex = 0;
        civilDateShift = 1;
      } else if (totalMin < 30) {
        hourBranchIndex = 0;
        civilDateShift = 0;
      } else {
        // 30분 오프셋: 01:30–03:29 = 丑 등. 대략 근사.
        const shifted = Math.floor((totalMin - 30) / 120) + 1;
        hourBranchIndex = shifted % 12;
        civilDateShift = 0;
      }
      break;
    }
  }

  // 오서둔: 일간에 따라 子時의 간 결정.
  //   甲·己 → 甲(0), 乙·庚 → 丙(2), 丙·辛 → 戊(4), 丁·壬 → 庚(6), 戊·癸 → 壬(8)
  const WUSODUN_ZI_STEM: readonly number[] = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  const ziStem = WUSODUN_ZI_STEM[dayStemIndex];
  if (ziStem === undefined) {
    throw new Error(`Invalid dayStemIndex: ${String(dayStemIndex)}`);
  }
  const hourStemIndex = (ziStem + hourBranchIndex) % 10;

  const pairLabels = ["甲·己", "乙·庚", "丙·辛", "丁·壬", "戊·癸"];
  const pairIdx = dayStemIndex % 5;
  const ziStemHan = getStem(ziStem).han;

  return {
    pillar: {
      stem: getStem(hourStemIndex),
      branch: getBranch(hourBranchIndex),
    },
    hourBranchIndex,
    civilDateShift,
    wusodunRule: `${pairLabels[pairIdx]} 日 → 子時 ${ziStemHan}`,
  };
}
