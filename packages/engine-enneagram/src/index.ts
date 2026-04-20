// 에니어그램 9유형 엔진. 상세 스펙: docs/14-engine-enneagram-spec-v0.1.md
// 유형 네이밍: docs/83-enneagram-type-names-v0.1.md
// 구현은 P2 W5 (2026-05-30 ~ 06-05) 예정.

export const EngineId = "enneagram" as const;
export const SchemaVersion = "1.0.0";

export interface EnneagramInput {
  readonly _placeholder: true;
}

export interface EnneagramOutput {
  readonly _placeholder: true;
}

export function compute(_input: EnneagramInput): EnneagramOutput {
  throw new Error("[enneagram] not implemented. See docs/14-engine-enneagram-spec-v0.1.md");
}
