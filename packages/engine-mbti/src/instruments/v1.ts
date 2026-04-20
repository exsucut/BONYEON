// MBTI 계열 4축 자가진단 — Quick Screening v0.1 (16 items)
//
// docs/13-engine-mbti-spec-v0.1.md §3~4, docs/82-mbti-type-names-v0.1.md
//
// **주의**: 공식 MBTI® 문항이 아닙니다. 자체 저술 간이 검사.
// 축당 4문항(정방향 2 + 역방향 2). 축 커버리지 작아 신뢰도 'low' 플래그가 자주 발생.

export type AxisId = "ei" | "sn" | "tf" | "jp";
export type Direction = 1 | -1;

export interface InstrumentItem {
  readonly id: string;
  readonly axis: AxisId;
  readonly direction: Direction; // +1 = 문항이 동의일수록 "양극(E/N/F/P)"
  readonly prompt: string;
}

export const INSTRUMENT_VERSION = "mbti-inst@1" as const;

export const ITEMS: readonly InstrumentItem[] = [
  // ── E / I (외향 / 내향) ────────────────────────────────────
  { id: "ei-01", axis: "ei", direction: 1, prompt: "새로운 모임에 가면 오히려 기운이 납니다." },
  { id: "ei-02", axis: "ei", direction: -1, prompt: "혼자 있는 시간이 길어져도 에너지가 회복됩니다." },
  { id: "ei-03", axis: "ei", direction: 1, prompt: "생각은 대체로 말하면서 정리되는 편입니다." },
  { id: "ei-04", axis: "ei", direction: -1, prompt: "여러 사람과 오래 있으면 피로감을 뚜렷이 느낍니다." },

  // ── S / N (감각 / 직관) ────────────────────────────────────
  { id: "sn-01", axis: "sn", direction: 1, prompt: "일어나지 않은 일을 상상하며 시간을 보내는 경우가 많습니다." },
  { id: "sn-02", axis: "sn", direction: -1, prompt: "글을 읽을 때 구체적인 예시가 있어야 이해가 잘됩니다." },
  { id: "sn-03", axis: "sn", direction: 1, prompt: "사물보다 그 이면의 의미나 패턴이 먼저 눈에 들어옵니다." },
  { id: "sn-04", axis: "sn", direction: -1, prompt: "계획은 현재 눈에 보이는 사실 위주로 세우는 편입니다." },

  // ── T / F (사고 / 감정) ────────────────────────────────────
  { id: "tf-01", axis: "tf", direction: 1, prompt: "결정을 내릴 때 관련 사람의 감정을 가장 먼저 고려합니다." },
  { id: "tf-02", axis: "tf", direction: -1, prompt: "논리가 맞지 않으면 상대의 감정이 상해도 지적하는 편입니다." },
  { id: "tf-03", axis: "tf", direction: 1, prompt: "평가나 조언을 할 때 상대의 상황에 먼저 공감하려 합니다." },
  { id: "tf-04", axis: "tf", direction: -1, prompt: "원칙과 일관성을 감정보다 중요하게 여깁니다." },

  // ── J / P (판단 / 인식) ────────────────────────────────────
  { id: "jp-01", axis: "jp", direction: 1, prompt: "가능성이 열려 있는 상태를 오래 유지하는 편입니다." },
  { id: "jp-02", axis: "jp", direction: -1, prompt: "계획이 어긋나면 일단 불편함을 느낍니다." },
  { id: "jp-03", axis: "jp", direction: 1, prompt: "마감 직전에 몰아서 작업하는 편이 효율적이라고 느낍니다." },
  { id: "jp-04", axis: "jp", direction: -1, prompt: "일정과 할 일 목록을 미리 정리해두는 편이 편합니다." },
];

/**
 * direction=+1 인 문항이 동의되면 다음 pole로 기울어집니다.
 *   ei → E(외향), sn → N(직관), tf → F(감정), jp → P(인식)
 * direction=-1 은 반대 pole로.
 */
export const POSITIVE_POLE: Record<AxisId, "E" | "N" | "F" | "P"> = {
  ei: "E",
  sn: "N",
  tf: "F",
  jp: "P",
};
export const NEGATIVE_POLE: Record<AxisId, "I" | "S" | "T" | "J"> = {
  ei: "I",
  sn: "S",
  tf: "T",
  jp: "J",
};
