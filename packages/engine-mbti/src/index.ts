// 4축 성향 엔진 (MBTI 계열, 자체 문항). docs/13-engine-mbti-spec-v0.1.md

import {
  INSTRUMENT_VERSION,
  ITEMS,
  NEGATIVE_POLE,
  POSITIVE_POLE,
  type AxisId,
  type InstrumentItem,
} from "./instruments/v1.js";
import { AXIS_LABELS, TYPE_NAMES, type TypeName } from "./type-names.js";

export const EngineId = "mbti" as const;
export const SchemaVersion = "0.1.0";

export { INSTRUMENT_VERSION, ITEMS, AXIS_LABELS, TYPE_NAMES };
export type { AxisId, InstrumentItem, TypeName };

// ─────────────────────────────────────────────────────────────

export type LikertValue = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Pole = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
export type Confidence = "low" | "medium" | "high";

export interface MbtiAnswer {
  readonly questionId: string;
  readonly value: LikertValue;
}

export interface MbtiInput {
  readonly answers: readonly MbtiAnswer[];
  readonly instrumentVersion: string;
}

export interface AxisResult {
  readonly rawScore: number;
  readonly normalized: number; // -100..+100
  readonly pole: Pole;
  readonly confidence: Confidence;
}

export type ReliabilityFlag = "low_consistency" | "too_neutral" | "incomplete";

export interface MbtiOutput {
  readonly code: string; // "INTJ" 등
  readonly typeName: TypeName;
  readonly axes: {
    readonly ei: AxisResult;
    readonly sn: AxisResult;
    readonly tf: AxisResult;
    readonly jp: AxisResult;
  };
  readonly reliability: {
    readonly consistency: number; // 0..1
    readonly decisiveness: number; // 0..1
    readonly completion: number; // 0..1
    readonly flags: readonly ReliabilityFlag[];
  };
  readonly boundaryNotices: ReadonlyArray<{
    readonly axis: AxisId;
    readonly distance: number;
    readonly alternateCode: string;
  }>;
  readonly trace: {
    readonly instrumentVersion: string;
    readonly itemCount: number;
    readonly answeredCount: number;
    readonly axisBreakdown: Record<AxisId, {
      readonly items: ReadonlyArray<{
        readonly itemId: string;
        readonly value: number;
        readonly delta: number;
      }>;
      readonly rawScore: number;
      readonly normalized: number;
    }>;
  };
}

// ─────────────────────────────────────────────────────────────

const AXES: readonly AxisId[] = ["ei", "sn", "tf", "jp"];

export function compute(input: MbtiInput): MbtiOutput {
  const answered = new Map<string, LikertValue>();
  for (const a of input.answers) answered.set(a.questionId, a.value);

  const axisBreakdown: Record<AxisId, MbtiOutput["trace"]["axisBreakdown"][AxisId]> = {
    ei: { items: [], rawScore: 0, normalized: 0 },
    sn: { items: [], rawScore: 0, normalized: 0 },
    tf: { items: [], rawScore: 0, normalized: 0 },
    jp: { items: [], rawScore: 0, normalized: 0 },
  };

  const axisResults: Record<AxisId, AxisResult> = {} as Record<AxisId, AxisResult>;

  for (const axis of AXES) {
    const items = ITEMS.filter((i) => i.axis === axis);
    const contrib: Array<{ itemId: string; value: number; delta: number }> = [];
    let sum = 0;
    let answeredInAxis = 0;
    for (const item of items) {
      const v = answered.get(item.id);
      if (v === undefined) {
        contrib.push({ itemId: item.id, value: 0, delta: 0 });
        continue;
      }
      const centered = v - 4; // -3..+3
      const delta = centered * item.direction;
      sum += delta;
      answeredInAxis++;
      contrib.push({ itemId: item.id, value: v, delta });
    }
    const maxAbs = items.length * 3;
    const normalized = maxAbs === 0 ? 0 : (sum / maxAbs) * 100;

    const pole: Pole = normalized >= 0 ? POSITIVE_POLE[axis] : NEGATIVE_POLE[axis];
    // Tie-breaking at exactly 0: prefer 'I','S','T','J' (alphabetically earlier, low energy default)
    const resolvedPole: Pole = normalized === 0 && answeredInAxis > 0 ? NEGATIVE_POLE[axis] : pole;

    const absN = Math.abs(normalized);
    const confidence: Confidence = absN >= 30 ? "high" : absN >= 10 ? "medium" : "low";

    axisResults[axis] = {
      rawScore: sum,
      normalized,
      pole: resolvedPole,
      confidence,
    };
    axisBreakdown[axis] = {
      items: contrib,
      rawScore: sum,
      normalized,
    };
  }

  const code = `${axisResults.ei.pole}${axisResults.sn.pole}${axisResults.tf.pole}${axisResults.jp.pole}`;

  // Boundary notices
  const boundaryNotices: Array<{
    axis: AxisId;
    distance: number;
    alternateCode: string;
  }> = [];
  for (const axis of AXES) {
    const r = axisResults[axis];
    if (Math.abs(r.normalized) < 10) {
      boundaryNotices.push({
        axis,
        distance: r.normalized,
        alternateCode: flipAxis(code, axis),
      });
    }
  }

  // Reliability
  const totalItems = ITEMS.length;
  const completion = answered.size / totalItems;
  const neutralCount = input.answers.filter((a) => a.value === 4).length;
  const decisiveness = 1 - (input.answers.length === 0 ? 1 : neutralCount / input.answers.length);
  const consistency = computeConsistency(answered);

  const flags: ReliabilityFlag[] = [];
  if (completion < 1) flags.push("incomplete");
  if (consistency < 0.5) flags.push("low_consistency");
  if (neutralCount / Math.max(1, input.answers.length) > 0.5) flags.push("too_neutral");

  return {
    code,
    typeName: TYPE_NAMES[code] ?? {
      kr: code,
      en: code,
      keywords: [],
      misconception: "",
    },
    axes: axisResults,
    reliability: {
      consistency,
      decisiveness,
      completion,
      flags,
    },
    boundaryNotices,
    trace: {
      instrumentVersion: input.instrumentVersion,
      itemCount: totalItems,
      answeredCount: answered.size,
      axisBreakdown,
    },
  };
}

function flipAxis(code: string, axis: AxisId): string {
  const pos = { ei: 0, sn: 1, tf: 2, jp: 3 }[axis];
  const cur = code[pos];
  const flip: Record<string, string> = {
    E: "I", I: "E",
    S: "N", N: "S",
    T: "F", F: "T",
    J: "P", P: "J",
  };
  const f = flip[cur ?? ""] ?? cur;
  return code.slice(0, pos) + f + code.slice(pos + 1);
}

function computeConsistency(answered: Map<string, LikertValue>): number {
  // Pair +direction items with -direction items within each axis.
  // If both answered, the "effective delta" signs should agree. Count agreement ratio.
  let pairs = 0;
  let agreements = 0;
  for (const axis of AXES) {
    const pos = ITEMS.filter((i) => i.axis === axis && i.direction === 1);
    const neg = ITEMS.filter((i) => i.axis === axis && i.direction === -1);
    const n = Math.min(pos.length, neg.length);
    for (let i = 0; i < n; i++) {
      const p = answered.get(pos[i]!.id);
      const q = answered.get(neg[i]!.id);
      if (p === undefined || q === undefined) continue;
      pairs++;
      const pDelta = (p - 4) * 1;
      const qDelta = (q - 4) * -1;
      // Both deltas should push axis in same direction → same sign
      if (Math.sign(pDelta) === Math.sign(qDelta) || pDelta === 0 || qDelta === 0) {
        agreements++;
      }
    }
  }
  if (pairs === 0) return 1; // vacuous
  return agreements / pairs;
}
