// 자미두수 엔진. 상세 스펙: docs/11-engine-ziweidoushu-spec-v0.1.md
// 구현은 P2 W3 (2026-05-16 ~ 05-22) 예정.

export const EngineId = "ziweidoushu" as const;
export const SchemaVersion = "1.0.0";

export interface ZiweiInput {
  readonly _placeholder: true;
}

export interface ZiweiOutput {
  readonly _placeholder: true;
}

export function compute(_input: ZiweiInput): ZiweiOutput {
  throw new Error("[ziweidoushu] not implemented. See docs/11-engine-ziweidoushu-spec-v0.1.md");
}
