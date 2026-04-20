// 해석 레이어. 상세 스펙: docs/20-interpretation-layer-spec-v0.1.md
// 템플릿 우선 + LLM 보조. 구현은 P2 W6 (2026-06-06 ~ 06-12) 예정.

export const Version = "0.0.0";

export type SectionId =
  | "overview"
  | "strength"
  | "weakness"
  | "relationship"
  | "opportunity"
  | "caution"
  | "cross";

export interface GenerateRequest {
  readonly _placeholder: true;
}

export interface GenerateResult {
  readonly _placeholder: true;
}

export function generate(_req: GenerateRequest): Promise<GenerateResult> {
  throw new Error("[interpretation] not implemented. See docs/20-interpretation-layer-spec-v0.1.md");
}
