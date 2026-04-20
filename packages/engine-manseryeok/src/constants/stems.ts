// 부록 A — 천간 10
// docs/10-engine-manseryeok-spec-v0.1.md §부록A

export type ElementKo = "목" | "화" | "토" | "금" | "수";
export type Yin_Yang = "양" | "음";

export interface Stem {
  readonly index: number; // 0..9
  readonly han: string; // 甲 etc
  readonly kr: string; // 갑 etc
  readonly element: ElementKo;
  readonly yinyang: Yin_Yang;
}

export const STEMS: readonly Stem[] = [
  { index: 0, han: "甲", kr: "갑", element: "목", yinyang: "양" },
  { index: 1, han: "乙", kr: "을", element: "목", yinyang: "음" },
  { index: 2, han: "丙", kr: "병", element: "화", yinyang: "양" },
  { index: 3, han: "丁", kr: "정", element: "화", yinyang: "음" },
  { index: 4, han: "戊", kr: "무", element: "토", yinyang: "양" },
  { index: 5, han: "己", kr: "기", element: "토", yinyang: "음" },
  { index: 6, han: "庚", kr: "경", element: "금", yinyang: "양" },
  { index: 7, han: "辛", kr: "신", element: "금", yinyang: "음" },
  { index: 8, han: "壬", kr: "임", element: "수", yinyang: "양" },
  { index: 9, han: "癸", kr: "계", element: "수", yinyang: "음" },
] as const;

export const getStem = (index: number): Stem => {
  const s = STEMS[((index % 10) + 10) % 10];
  if (!s) throw new Error(`Invariant: STEMS lookup failed for index=${String(index)}`);
  return s;
};
