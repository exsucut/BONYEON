// 부록 B — 지지 12
// docs/10-engine-manseryeok-spec-v0.1.md §부록B

import type { ElementKo, Yin_Yang } from "./stems.js";

export interface Branch {
  readonly index: number; // 0..11 (0=子, 2=寅, ...)
  readonly han: string;
  readonly kr: string;
  readonly element: ElementKo;
  readonly yinyang: Yin_Yang;
  readonly animal: string;
}

export const BRANCHES: readonly Branch[] = [
  { index: 0, han: "子", kr: "자", element: "수", yinyang: "양", animal: "쥐" },
  { index: 1, han: "丑", kr: "축", element: "토", yinyang: "음", animal: "소" },
  { index: 2, han: "寅", kr: "인", element: "목", yinyang: "양", animal: "호랑이" },
  { index: 3, han: "卯", kr: "묘", element: "목", yinyang: "음", animal: "토끼" },
  { index: 4, han: "辰", kr: "진", element: "토", yinyang: "양", animal: "용" },
  { index: 5, han: "巳", kr: "사", element: "화", yinyang: "음", animal: "뱀" },
  { index: 6, han: "午", kr: "오", element: "화", yinyang: "양", animal: "말" },
  { index: 7, han: "未", kr: "미", element: "토", yinyang: "음", animal: "양" },
  { index: 8, han: "申", kr: "신", element: "금", yinyang: "양", animal: "원숭이" },
  { index: 9, han: "酉", kr: "유", element: "금", yinyang: "음", animal: "닭" },
  { index: 10, han: "戌", kr: "술", element: "토", yinyang: "양", animal: "개" },
  { index: 11, han: "亥", kr: "해", element: "수", yinyang: "음", animal: "돼지" },
] as const;

export const getBranch = (index: number): Branch => {
  const b = BRANCHES[((index % 12) + 12) % 12];
  if (!b) throw new Error(`Invariant: BRANCHES lookup failed for index=${String(index)}`);
  return b;
};
