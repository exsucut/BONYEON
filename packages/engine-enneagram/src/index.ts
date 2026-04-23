// Enneagram 9유형 엔진. docs/14-engine-enneagram-spec-v0.1.md

import {
  INSTRUMENT_VERSION,
  ITEMS,
  type EnneaType,
  type InstrumentItem,
} from "./instruments/v1.js";
import {
  ARROWS,
  TRIAD_LABELS,
  TYPE_NAMES,
  WING_NEIGHBORS,
  type Triad,
  type TypeName,
} from "./type-names.js";

export const EngineId = "enneagram" as const;
export const SchemaVersion = "0.1.0";

export {
  INSTRUMENT_VERSION,
  ITEMS,
  TYPE_NAMES,
  TRIAD_LABELS,
  WING_NEIGHBORS,
  ARROWS,
};
export type { EnneaType, InstrumentItem, Triad, TypeName };

// ─────────────────────────────────────────────────────────────

export type LikertValue = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface EnneagramAnswer {
  readonly questionId: string;
  readonly value: LikertValue;
}

export interface EnneagramInput {
  readonly answers: readonly EnneagramAnswer[];
  readonly instrumentVersion: string;
}

export interface EnneagramOutput {
  readonly primaryType: EnneaType;
  readonly wing: {
    readonly side: "left" | "right" | "none";
    readonly type: EnneaType | null;
    readonly strength: number; // 0..1
  };
  readonly typeScores: Record<EnneaType, number>; // 0..100
  readonly orderedTypes: ReadonlyArray<{ readonly type: EnneaType; readonly score: number }>;
  readonly triad: {
    readonly body: number;
    readonly heart: number;
    readonly head: number;
    readonly dominant: Triad;
  };
  readonly arrows: {
    readonly integrationTo: EnneaType;
    readonly disintegrationTo: EnneaType;
  };
  readonly reliability: {
    readonly completion: number; // 0..1
    readonly decisiveness: number; // 0..1
    readonly flags: readonly EnneaReliabilityFlag[];
  };
  readonly ambiguity: {
    readonly nearTies: ReadonlyArray<{ readonly type: EnneaType; readonly score: number }>;
    readonly note: string;
  } | null;
  readonly trace: {
    readonly instrumentVersion: string;
    readonly itemCount: number;
    readonly answeredCount: number;
    readonly rawByType: Record<EnneaType, number>;
  };
}

export type EnneaReliabilityFlag = "incomplete" | "too_neutral";

// ─────────────────────────────────────────────────────────────

const TYPES: readonly EnneaType[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function compute(input: EnneagramInput): EnneagramOutput {
  const answered = new Map<string, LikertValue>();
  for (const a of input.answers) answered.set(a.questionId, a.value);

  const rawByType: Record<EnneaType, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
  };
  const countsByType: Record<EnneaType, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
  };

  for (const item of ITEMS) {
    countsByType[item.type]++;
    const v = answered.get(item.id);
    if (v === undefined) continue;
    const centered = v - 4; // -3..+3
    rawByType[item.type] += centered * item.direction;
  }

  const typeScores: Record<EnneaType, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
  };
  for (const t of TYPES) {
    const maxAbs = countsByType[t] * 3;
    typeScores[t] = maxAbs === 0 ? 0 : Math.max(0, ((rawByType[t] + maxAbs) / (2 * maxAbs)) * 100);
  }

  const ordered = TYPES
    .map((t) => ({ type: t, score: typeScores[t] }))
    .sort((a, b) => b.score - a.score || a.type - b.type);

  const top = ordered[0]!;
  const primaryType = top.type;

  // Wing
  const [leftNb, rightNb] = WING_NEIGHBORS[primaryType];
  const leftScore = typeScores[leftNb];
  const rightScore = typeScores[rightNb];
  const maxNb = Math.max(leftScore, rightScore);
  const minNb = Math.min(leftScore, rightScore);
  const wingType: EnneaType | null = maxNb === 0 ? null : leftScore >= rightScore ? leftNb : rightNb;
  const wingSide: "left" | "right" | "none" = wingType === null ? "none" : wingType === leftNb ? "left" : "right";
  const strength = maxNb === 0 ? 0 : (maxNb - minNb) / 100;

  // Triad
  const triad = {
    body: typeScores[1] + typeScores[8] + typeScores[9],
    heart: typeScores[2] + typeScores[3] + typeScores[4],
    head: typeScores[5] + typeScores[6] + typeScores[7],
    dominant: "body" as Triad,
  };
  triad.dominant = (["body", "heart", "head"] as const).reduce((a, b) =>
    triad[a] >= triad[b] ? a : b,
  );

  // Ambiguity (nearTies: top-2 within 5 points)
  let ambiguity: EnneagramOutput["ambiguity"] = null;
  if (ordered.length >= 2) {
    const second = ordered[1]!;
    if (top.score - second.score < 5 && top.score > 0) {
      ambiguity = {
        nearTies: [
          { type: top.type, score: top.score },
          { type: second.type, score: second.score },
        ],
        note: "두 유형의 경향이 비슷하게 측정되었습니다. 본인의 내적 동기를 더 잘 설명하는 쪽을 주된 해석 기준으로 삼기를 권합니다.",
      };
    }
  }

  // Reliability
  const completion = answered.size / ITEMS.length;
  const neutralCount = input.answers.filter((a) => a.value === 4).length;
  const decisiveness = input.answers.length === 0 ? 0 : 1 - neutralCount / input.answers.length;
  const flags: EnneaReliabilityFlag[] = [];
  if (completion < 1) flags.push("incomplete");
  if (neutralCount / Math.max(1, input.answers.length) > 0.5) flags.push("too_neutral");

  return {
    primaryType,
    wing: {
      side: wingSide,
      type: wingType,
      strength,
    },
    typeScores,
    orderedTypes: ordered,
    triad,
    arrows: {
      integrationTo: ARROWS[primaryType].integration,
      disintegrationTo: ARROWS[primaryType].disintegration,
    },
    reliability: {
      completion,
      decisiveness,
      flags,
    },
    ambiguity,
    trace: {
      instrumentVersion: input.instrumentVersion,
      itemCount: ITEMS.length,
      answeredCount: answered.size,
      rawByType,
    },
  };
}
