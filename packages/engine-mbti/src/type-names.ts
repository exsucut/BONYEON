// 16유형 자체 네이밍.
// docs/82-mbti-type-names-v0.1.md — 공식 MBTI·16Personalities 명칭 차용 금지.

export interface TypeName {
  readonly kr: string;
  readonly en: string;
  readonly keywords: readonly string[];
  readonly misconception: string;
}

export const TYPE_NAMES: Record<string, TypeName> = {
  INTJ: { kr: "먼 설계자", en: "The Far-Sighted", keywords: ["구상", "전략", "고독감", "인내"], misconception: "무심해 보이지만 내면은 강한 책임감입니다." },
  INTP: { kr: "순환하는 사유", en: "The Circling Thought", keywords: ["탐구", "모형", "분해", "무관심"], misconception: "관심 있는 주제에만 깊이 몰입합니다." },
  ENTJ: { kr: "지휘의 호흡", en: "The Grand Tempo", keywords: ["조직", "결단", "속도", "고강도"], misconception: "감정을 덜 드러내는 것이 공감 부재는 아닙니다." },
  ENTP: { kr: "반전의 기수", en: "The Pivoter", keywords: ["아이디어", "도전", "논쟁", "유희"], misconception: "반박이 공격이 아니라 사고 도구입니다." },
  INFJ: { kr: "조용한 조율", en: "The Quiet Tuner", keywords: ["통찰", "사명", "민감", "고갈"], misconception: "이상주의와 현실적 실행이 공존합니다." },
  INFP: { kr: "깊은 결", en: "The Inward Grain", keywords: ["가치", "상상", "진심", "흔들림"], misconception: "무르게 보여도 가치 앞에서는 단단합니다." },
  ENFJ: { kr: "환한 촉매", en: "The Warm Catalyst", keywords: ["격려", "영향", "비전", "부담"], misconception: "타인을 돌보는 만큼 자신도 돌봐야 합니다." },
  ENFP: { kr: "열린 호기", en: "The Open Spark", keywords: ["열정", "연결", "상상", "산만"], misconception: "가볍다기보다 폭이 넓은 사람입니다." },
  ISTJ: { kr: "성실한 축", en: "The Steady Pillar", keywords: ["책임", "정확", "보존", "완고"], misconception: "유연함 부족이 아니라 신중함입니다." },
  ISFJ: { kr: "따뜻한 유지", en: "The Gentle Keeper", keywords: ["헌신", "기억", "배려", "과부하"], misconception: "말수 적어도 관찰은 섬세합니다." },
  ESTJ: { kr: "질서의 운영자", en: "The Prime Operator", keywords: ["실행", "체계", "권위", "경직"], misconception: "원칙 고수가 관계 거부는 아닙니다." },
  ESFJ: { kr: "결속의 주파수", en: "The Binding Host", keywords: ["화합", "감정지능", "책임", "평판의식"], misconception: "배려가 지나쳐 자기 소진 위험을 살필 것." },
  ISTP: { kr: "조용한 기술자", en: "The Silent Tinker", keywords: ["실용", "즉흥", "분석", "거리감"], misconception: "감정 표현이 적을 뿐 감각은 예민합니다." },
  ISFP: { kr: "잔잔한 미감", en: "The Soft Palette", keywords: ["감각", "조율", "자유", "회피"], misconception: "온순함 뒤의 뚜렷한 주관이 있습니다." },
  ESTP: { kr: "즉각의 리드", en: "The Live Charge", keywords: ["순발력", "행동", "담대", "소란"], misconception: "즉흥성이 경솔과 동의어는 아닙니다." },
  ESFP: { kr: "빛나는 합주", en: "The Bright Ensemble", keywords: ["활력", "공감", "현장", "몰입의 쏠림"], misconception: "진지한 내면도 깊게 존재합니다." },
};

export const AXIS_LABELS = {
  ei: { positive: "바깥으로 뻗는 에너지", negative: "안으로 모이는 에너지" },
  sn: { positive: "맥락·직관 중심", negative: "구체·감각 중심" },
  tf: { positive: "관계·맥락 기준", negative: "일관된 기준" },
  jp: { positive: "유연·열린 선호", negative: "구조·마감 선호" },
} as const;
