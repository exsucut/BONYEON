// 부록 H — 납음오행 (60갑자)
// docs/10-engine-manseryeok-spec-v0.1.md §7.7, §부록H
// 2개 간지마다 같은 납음. 총 30개 중 5오행 × 6계열.

import { sexagenaryCycleIndex } from "./kongmang.js";

/**
 * 30 entries. Each entry covers 2 consecutive sexagenary indices.
 * Index in this array = floor(cycleIdx / 2).
 */
const NAPEUM_BY_PAIR: readonly string[] = [
  "海中金", // 甲子·乙丑
  "爐中火", // 丙寅·丁卯
  "大林木", // 戊辰·己巳
  "路傍土", // 庚午·辛未
  "劍鋒金", // 壬申·癸酉
  "山頭火", // 甲戌·乙亥
  "澗下水", // 丙子·丁丑
  "城頭土", // 戊寅·己卯
  "白鑞金", // 庚辰·辛巳
  "楊柳木", // 壬午·癸未
  "泉中水", // 甲申·乙酉
  "屋上土", // 丙戌·丁亥
  "霹靂火", // 戊子·己丑
  "松柏木", // 庚寅·辛卯
  "長流水", // 壬辰·癸巳
  "沙中金", // 甲午·乙未
  "山下火", // 丙申·丁酉
  "平地木", // 戊戌·己亥
  "壁上土", // 庚子·辛丑
  "金箔金", // 壬寅·癸卯
  "覆燈火", // 甲辰·乙巳
  "天河水", // 丙午·丁未
  "大驛土", // 戊申·己酉
  "釵釧金", // 庚戌·辛亥
  "桑柘木", // 壬子·癸丑
  "大溪水", // 甲寅·乙卯
  "沙中土", // 丙辰·丁巳
  "天上火", // 戊午·己未
  "石榴木", // 庚申·辛酉
  "大海水", // 壬戌·癸亥
];

export function napeum(stemIdx: number, branchIdx: number): string {
  const cycleIdx = sexagenaryCycleIndex(stemIdx, branchIdx);
  const pairIdx = Math.floor(cycleIdx / 2);
  const n = NAPEUM_BY_PAIR[pairIdx];
  if (!n) throw new Error(`Invariant: NAPEUM lookup failed for cycleIdx=${String(cycleIdx)}`);
  return n;
}
