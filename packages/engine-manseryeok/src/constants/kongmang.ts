// 부록 G — 순중공망 (旬中空亡)
// docs/10-engine-manseryeok-spec-v0.1.md §7.6, §부록G
//
// 60갑자는 10개의 순(旬)으로 나뉜다.
//   갑자순(1-10):   甲子~癸酉 → 공망 戌·亥
//   갑술순(11-20):  甲戌~癸未 → 공망 申·酉
//   갑신순(21-30):  甲申~癸巳 → 공망 午·未
//   갑오순(31-40):  甲午~癸卯 → 공망 辰·巳
//   갑진순(41-50):  甲辰~癸丑 → 공망 寅·卯
//   갑인순(51-60):  甲寅~癸亥 → 공망 子·丑

import { getBranch, type Branch } from "./branches.js";

export type KongmangPair = readonly [Branch, Branch];

/**
 * Given a sexagenary cycle index (0..59), return the two-branch 공망.
 * Cycle index = 10*(stem%10) - ... — but derived purely from (stemIdx, branchIdx).
 * Standard: cycleIdx = (branchIdx - stemIdx + 60) % 60 with stem paired.
 *
 * Easier: 60갑자 순번(0..59) = sexagenaryIndex = (branchIdx - stemIdx + 60) % 12 gives
 * the "순 within cycle". Actually easier: sunIdx = floor(cycleIdx / 10).
 *
 * We derive cycleIdx directly from (stemIdx, branchIdx):
 *   cycleIdx ∈ 0..59 is the solution of
 *     cycleIdx % 10 == stemIdx
 *     cycleIdx % 12 == branchIdx
 *   This has a unique solution when (branchIdx - stemIdx) is even (which it is for all
 *   valid sexagenary combinations). CRT: cycleIdx = stemIdx + 10*k where
 *   10*k ≡ (branchIdx - stemIdx) (mod 12), i.e. k ≡ (branchIdx - stemIdx) * 10^{-1} (mod 12).
 *   10 mod 12 = 10, and 10^{-1} mod 12 does not exist (gcd(10,12)=2). But since
 *   (branchIdx - stemIdx) is always even, we can simplify:
 *     k = ((branchIdx - stemIdx) / 2) mod 6
 */
export function sexagenaryCycleIndex(stemIdx: number, branchIdx: number): number {
  const diff = (((branchIdx - stemIdx) % 12) + 12) % 12;
  if (diff % 2 !== 0) {
    throw new Error(
      `Invalid sexagenary combination: stem=${String(stemIdx)}, branch=${String(branchIdx)}`,
    );
  }
  const k = (diff / 2) % 6;
  return stemIdx + 10 * k;
}

export function kongmang(stemIdx: number, branchIdx: number): KongmangPair {
  const cycleIdx = sexagenaryCycleIndex(stemIdx, branchIdx);
  const sunIdx = Math.floor(cycleIdx / 10); // 0..5
  // 갑자순(0) → 戌·亥 = branches 10, 11
  // 갑술순(1) → 申·酉 = 8, 9
  // 갑신순(2) → 午·未 = 6, 7
  // 갑오순(3) → 辰·巳 = 4, 5
  // 갑진순(4) → 寅·卯 = 2, 3
  // 갑인순(5) → 子·丑 = 0, 1
  const firstBranchOfKongmang = 10 - 2 * sunIdx;
  return [getBranch(firstBranchOfKongmang), getBranch(firstBranchOfKongmang + 1)];
}
