// 부록 E — 지장간 (월률분야)
// docs/10-engine-manseryeok-spec-v0.1.md §7.5, §부록E

import { STEMS, type Stem } from "./stems.js";

export type HiddenStemType = "early" | "middle" | "main";

export interface HiddenStem {
  readonly stem: Stem;
  readonly type: HiddenStemType;
  readonly days: number;
}

/**
 * Maps each branch index (0=子 .. 11=亥) to its hidden stem list.
 * Each list's `days` sum equals 30 (invariant).
 */
export const HIDDEN_STEMS: Record<number, readonly HiddenStem[]> = {
  0: [
    { stem: STEMS[8]!, type: "early", days: 10 }, // 壬
    { stem: STEMS[9]!, type: "main", days: 20 }, // 癸
  ],
  1: [
    { stem: STEMS[9]!, type: "early", days: 9 }, // 癸
    { stem: STEMS[7]!, type: "middle", days: 3 }, // 辛
    { stem: STEMS[5]!, type: "main", days: 18 }, // 己
  ],
  2: [
    { stem: STEMS[4]!, type: "early", days: 7 }, // 戊
    { stem: STEMS[2]!, type: "middle", days: 7 }, // 丙
    { stem: STEMS[0]!, type: "main", days: 16 }, // 甲
  ],
  3: [
    { stem: STEMS[0]!, type: "early", days: 10 }, // 甲
    { stem: STEMS[1]!, type: "main", days: 20 }, // 乙
  ],
  4: [
    { stem: STEMS[1]!, type: "early", days: 9 }, // 乙
    { stem: STEMS[9]!, type: "middle", days: 3 }, // 癸
    { stem: STEMS[4]!, type: "main", days: 18 }, // 戊
  ],
  5: [
    { stem: STEMS[4]!, type: "early", days: 7 }, // 戊
    { stem: STEMS[6]!, type: "middle", days: 7 }, // 庚
    { stem: STEMS[2]!, type: "main", days: 16 }, // 丙
  ],
  6: [
    { stem: STEMS[2]!, type: "early", days: 10 }, // 丙
    { stem: STEMS[5]!, type: "middle", days: 9 }, // 己
    { stem: STEMS[3]!, type: "main", days: 11 }, // 丁
  ],
  7: [
    { stem: STEMS[3]!, type: "early", days: 9 }, // 丁
    { stem: STEMS[1]!, type: "middle", days: 3 }, // 乙
    { stem: STEMS[5]!, type: "main", days: 18 }, // 己
  ],
  8: [
    { stem: STEMS[4]!, type: "early", days: 7 }, // 戊
    { stem: STEMS[8]!, type: "middle", days: 7 }, // 壬
    { stem: STEMS[6]!, type: "main", days: 16 }, // 庚
  ],
  9: [
    { stem: STEMS[6]!, type: "early", days: 10 }, // 庚
    { stem: STEMS[7]!, type: "main", days: 20 }, // 辛
  ],
  10: [
    { stem: STEMS[7]!, type: "early", days: 9 }, // 辛
    { stem: STEMS[3]!, type: "middle", days: 3 }, // 丁
    { stem: STEMS[4]!, type: "main", days: 18 }, // 戊
  ],
  11: [
    { stem: STEMS[4]!, type: "early", days: 7 }, // 戊
    { stem: STEMS[0]!, type: "middle", days: 7 }, // 甲
    { stem: STEMS[8]!, type: "main", days: 16 }, // 壬
  ],
};
