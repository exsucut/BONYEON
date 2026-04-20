// 48주 원형 엔진. 상세 스펙: docs/12-engine-goldschneider-spec-v0.1.md
// 네이밍 워크시트: docs/81-goldschneider-archetype-names-v0.1.md
// 구현은 P2 W4 (2026-05-23 ~ 05-29) 예정.

export const EngineId = "goldschneider" as const;
export const SchemaVersion = "1.0.0";

export interface GoldschneiderInput {
  readonly _placeholder: true;
}

export interface GoldschneiderOutput {
  readonly _placeholder: true;
}

export function compute(_input: GoldschneiderInput): GoldschneiderOutput {
  throw new Error(
    "[goldschneider] not implemented. See docs/12-engine-goldschneider-spec-v0.1.md",
  );
}
