// 48주 원형 엔진. 상세 스펙: docs/12-engine-goldschneider-spec-v0.1.md
// v0.1: 고정 날짜 분할(±1일 경계일 변동은 UI에서 "경계" 안내).

import { findWeek, WEEKS, type SunSign, type WeekDefinition } from "./weeks.js";

export const EngineId = "goldschneider" as const;
export const SchemaVersion = "0.1.0";

export type { SunSign, Decanate, WeekDefinition } from "./weeks.js";
export { WEEKS } from "./weeks.js";

export interface GoldschneiderInput {
  readonly solarDate: {
    readonly year: number;
    readonly month: number;
    readonly day: number;
  };
}

export interface GoldschneiderOutput {
  readonly archetypeId: number;
  readonly weekKey: string;
  readonly nameKo: string;
  readonly nameEn: string;
  readonly sunSign: SunSign;
  readonly decanate: 1 | 2 | 3 | null;
  readonly isCusp: boolean;
  readonly cuspDetail: {
    readonly previousSign: SunSign;
    readonly nextSign: SunSign;
    readonly daysFromCenter: number;
  } | null;
  readonly keywords: readonly string[];
  readonly growthAxis: string;
  readonly trace: {
    readonly inputDate: string;
    readonly matchedWeekKey: string;
    readonly tableVersion: string;
  };
}

const TABLE_VERSION = "goldschneider-weeks@1";

export function compute(input: GoldschneiderInput): GoldschneiderOutput {
  const { year, month, day } = input.solarDate;
  const week = findWeek(month, day);

  const cuspDetail = week.isCusp && week.cuspOf ? computeCuspDetail(week, month, day) : null;

  return {
    archetypeId: week.id,
    weekKey: week.weekKey,
    nameKo: week.nameKo,
    nameEn: week.nameEn,
    sunSign: week.sunSign,
    decanate: week.decanate,
    isCusp: week.isCusp,
    cuspDetail,
    keywords: week.keywords,
    growthAxis: week.growthAxis,
    trace: {
      inputDate: `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      matchedWeekKey: week.weekKey,
      tableVersion: TABLE_VERSION,
    },
  };
}

function computeCuspDetail(
  week: WeekDefinition,
  month: number,
  day: number,
): GoldschneiderOutput["cuspDetail"] {
  if (!week.cuspOf) return null;

  // Approximate the center as the midpoint of start/end.
  // Good enough for "how close to the edge" reporting.
  const toOrdinal = (m: number, d: number) => m * 31 + d;
  const startOrd = toOrdinal(week.startMonth, week.startDay);
  const endOrd = toOrdinal(week.endMonth, week.endDay);
  const inputOrd = toOrdinal(month, day);
  const centerOrd = (startOrd + endOrd) / 2;
  const daysFromCenter = Math.round(inputOrd - centerOrd);

  return {
    previousSign: week.cuspOf[0],
    nextSign: week.cuspOf[1],
    daysFromCenter,
  };
}
