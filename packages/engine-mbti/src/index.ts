// 4축 성향 엔진 (MBTI 계열). 상세 스펙: docs/13-engine-mbti-spec-v0.1.md
// 유형 네이밍: docs/82-mbti-type-names-v0.1.md
// 구현은 P2 W4 (2026-05-23 ~ 05-29) 예정.

export const EngineId = "mbti" as const;
export const SchemaVersion = "1.0.0";

export interface MbtiInput {
  readonly _placeholder: true;
}

export interface MbtiOutput {
  readonly _placeholder: true;
}

export function compute(_input: MbtiInput): MbtiOutput {
  throw new Error("[mbti] not implemented. See docs/13-engine-mbti-spec-v0.1.md");
}
