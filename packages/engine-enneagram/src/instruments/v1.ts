// Enneagram 9유형 자가진단 — Quick Screening v0.1 (18 items)
//
// docs/14-engine-enneagram-spec-v0.1.md §3~4
// docs/83-enneagram-type-names-v0.1.md
//
// **주의**: RHETI·HSS 등 상업 검사지가 아닌 자체 저술 간이 검사.
// 9유형 × 2문항 = 18문항. 모두 정방향(direction=+1) — 동의할수록 해당 유형 점수 상승.

export type EnneaType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface InstrumentItem {
  readonly id: string;
  readonly type: EnneaType;
  readonly direction: 1 | -1;
  readonly prompt: string;
}

export const INSTRUMENT_VERSION = "ennea-inst@1" as const;

export const ITEMS: readonly InstrumentItem[] = [
  // Type 1 — 원칙의 축
  { id: "t1-01", type: 1, direction: 1, prompt: "옳다고 믿는 기준에 스스로 벗어나면 심하게 자책합니다." },
  { id: "t1-02", type: 1, direction: 1, prompt: "세상의 결함을 고쳐야 한다는 생각이 자주 듭니다." },

  // Type 2 — 다가가는 손
  { id: "t2-01", type: 2, direction: 1, prompt: "타인에게 필요한 사람이 되는 것이 큰 기쁨 중 하나입니다." },
  { id: "t2-02", type: 2, direction: 1, prompt: "사랑받기 위해 상대의 기분을 자주 살핍니다." },

  // Type 3 — 도달하는 동력
  { id: "t3-01", type: 3, direction: 1, prompt: "성과가 없는 하루가 계속되면 불안해집니다." },
  { id: "t3-02", type: 3, direction: 1, prompt: "나의 이미지와 인상을 상황에 맞게 조정하는 편입니다." },

  // Type 4 — 깊은 고유함
  { id: "t4-01", type: 4, direction: 1, prompt: "남들과 다른 길을 걷고 있다는 감각이 나를 이루는 일부입니다." },
  { id: "t4-02", type: 4, direction: 1, prompt: "무언가 결핍되어 있다는 느낌이 자주 따라옵니다." },

  // Type 5 — 거리 있는 관찰
  { id: "t5-01", type: 5, direction: 1, prompt: "사람들과 오래 어울리면 에너지가 빠르게 소진됩니다." },
  { id: "t5-02", type: 5, direction: 1, prompt: "충분히 이해하기 전까지는 행동하지 않으려 합니다." },

  // Type 6 — 경계하는 충성
  { id: "t6-01", type: 6, direction: 1, prompt: "최악의 시나리오를 먼저 떠올리는 편이 안전하다고 느낍니다." },
  { id: "t6-02", type: 6, direction: 1, prompt: "신뢰할 수 있는 기준이나 집단이 있을 때 안정감을 얻습니다." },

  // Type 7 — 열린 탐식
  { id: "t7-01", type: 7, direction: 1, prompt: "가능성이 열려 있지 않으면 갇힌 느낌이 듭니다." },
  { id: "t7-02", type: 7, direction: 1, prompt: "고통을 정면으로 응시하기보다 새로운 자극을 찾는 편입니다." },

  // Type 8 — 단호한 존재
  { id: "t8-01", type: 8, direction: 1, prompt: "불편한 진실이라도 감추지 않고 드러내는 편이 낫다고 봅니다." },
  { id: "t8-02", type: 8, direction: 1, prompt: "약해 보이는 것이 통제 상실만큼이나 싫습니다." },

  // Type 9 — 고요한 중심
  { id: "t9-01", type: 9, direction: 1, prompt: "갈등이 커지는 것만큼은 피하고 싶습니다." },
  { id: "t9-02", type: 9, direction: 1, prompt: "내 의견을 드러내는 것보다 분위기를 맞추는 편이 편합니다." },
];
