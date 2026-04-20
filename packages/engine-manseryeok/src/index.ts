// 만세력 엔진. 상세 스펙: docs/10-engine-manseryeok-spec-v0.1.md
// v0.1 scope: 양력 입력, KST 고정, unified 자시 완전 구현.

export const EngineId = "manseryeok" as const;
export const SchemaVersion = "0.1.0";

export { compute } from "./compute.js";
export type {
  ManseryeokInput,
  ManseryeokOutput,
  ManseryeokTrace,
  Pillar,
  JasiConvention,
  CalendarType,
  HiddenStemsByPillar,
} from "./types.js";
export type { Stem } from "./constants/stems.js";
export type { Branch } from "./constants/branches.js";
export type { HiddenStem, HiddenStemType } from "./constants/hidden-stems.js";
