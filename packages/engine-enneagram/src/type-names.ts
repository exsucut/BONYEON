// 9유형 자체 네이밍. docs/83-enneagram-type-names-v0.1.md

import type { EnneaType } from "./instruments/v1.js";

export type Triad = "body" | "heart" | "head";

export interface TypeName {
  readonly type: EnneaType;
  readonly kr: string;
  readonly en: string;
  readonly triad: Triad;
  readonly motivationKeywords: readonly string[];
  readonly fearKeywords: readonly string[];
}

export const TYPE_NAMES: Record<EnneaType, TypeName> = {
  1: { type: 1, kr: "원칙의 축", en: "The Principled Axis", triad: "body", motivationKeywords: ["옳음", "개선", "성실", "절제"], fearKeywords: ["부패", "오류", "비난"] },
  2: { type: 2, kr: "다가가는 손", en: "The Outreaching Hand", triad: "heart", motivationKeywords: ["연결", "돌봄", "유용함", "관대"], fearKeywords: ["무가치함", "거부"] },
  3: { type: 3, kr: "도달하는 동력", en: "The Reaching Drive", triad: "heart", motivationKeywords: ["성취", "적응", "효율", "인정"], fearKeywords: ["실패", "무존재감"] },
  4: { type: 4, kr: "깊은 고유함", en: "The Distinct Depth", triad: "heart", motivationKeywords: ["개성", "진정성", "감수성", "의미"], fearKeywords: ["평범함", "결핍"] },
  5: { type: 5, kr: "거리 있는 관찰", en: "The Withdrawn Lens", triad: "head", motivationKeywords: ["이해", "자립", "응시", "보존"], fearKeywords: ["무력함", "침범"] },
  6: { type: 6, kr: "경계하는 충성", en: "The Watchful Bond", triad: "head", motivationKeywords: ["안전", "책임", "동맹", "예측"], fearKeywords: ["버려짐", "무방비"] },
  7: { type: 7, kr: "열린 탐식", en: "The Open Appetite", triad: "head", motivationKeywords: ["자유", "가능성", "경험", "낙관"], fearKeywords: ["갇힘", "결핍감"] },
  8: { type: 8, kr: "단호한 존재", en: "The Decisive Presence", triad: "body", motivationKeywords: ["주도", "보호", "강도", "직면"], fearKeywords: ["통제 상실", "취약해짐"] },
  9: { type: 9, kr: "고요한 중심", en: "The Stilled Center", triad: "body", motivationKeywords: ["평화", "수용", "융화", "안정"], fearKeywords: ["단절", "갈등"] },
};

export const TRIAD_LABELS: Record<Triad, { kr: string; en: string; types: readonly EnneaType[] }> = {
  body: { kr: "본능", en: "Grounded Presence", types: [8, 9, 1] },
  heart: { kr: "감정", en: "Relational Heart", types: [2, 3, 4] },
  head: { kr: "사고", en: "Reflective Mind", types: [5, 6, 7] },
};

/** Wing candidates = immediate neighbors on the 9-point circle. */
export const WING_NEIGHBORS: Record<EnneaType, readonly [EnneaType, EnneaType]> = {
  1: [9, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 5],
  5: [4, 6],
  6: [5, 7],
  7: [6, 8],
  8: [7, 9],
  9: [8, 1],
};

/** Integration (growth) and Disintegration (stress) directions. */
export const ARROWS: Record<EnneaType, { integration: EnneaType; disintegration: EnneaType }> = {
  1: { integration: 7, disintegration: 4 },
  2: { integration: 4, disintegration: 8 },
  3: { integration: 6, disintegration: 9 },
  4: { integration: 1, disintegration: 2 },
  5: { integration: 8, disintegration: 7 },
  6: { integration: 9, disintegration: 3 },
  7: { integration: 5, disintegration: 1 },
  8: { integration: 2, disintegration: 5 },
  9: { integration: 3, disintegration: 6 },
};
