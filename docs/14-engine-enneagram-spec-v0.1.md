---
doc: 14-engine-enneagram-spec
version: 0.1
status: draft
owner: 1인 풀스택
depends_on:
  - 01-data-model-v0.1
scope: Enneagram(9가지 원형) 자가 진단 엔진
---

# 14. Enneagram 엔진 스펙

> 에니어그램은 9가지 기본 유형(Type 1~9)으로 성격의 핵심 동기·두려움·욕망을 분류하는 체계다. 용어는 공용(public domain) 영역이며 "Enneagram"은 일반 명사로 취급된다. 다만 Riso-Hudson의 *Enneagram Type Indicator (RHETI®)*, Hurley-Dobson 등 **상업 검사지**는 상표·저작권 대상이므로 사용하지 않는다. 우리는 자체 문항으로 9 유형을 판정한다.

---

## 0. IP·용어 주의

- "Enneagram" 단어 자체는 자유롭게 사용 가능.
- 각 유형의 공용 명칭은 학파별로 다르다 — 우리는 번호(Type 1~9)를 주 식별자로, 한글 명칭은 자체 저술한 **중립형 이름**을 덧붙인다.
  - 참고: Riso-Hudson 명칭("The Reformer", "The Helper" 등)은 그대로 차용 금지 — 유사 의미의 자체 단어 사용.
- **트라이어드(Triad)**·**윙(Wing)**·**통합/분열(Integration/Disintegration) 화살표**는 공용 지식.
- **Instincts (sp/so/sx)**와 **27 subtype**은 v2로 미룸.

---

## 1. 책임 범위

### In-scope
- 자체 문항 기반 9 유형 점수화
- 유형 + 윙(좌/우) 판정
- 트라이어드(본능·감정·사고) 분포
- 통합·분열 방향 안내
- 일관성·신뢰도 플래그 (MBTI 엔진과 동일 골격)

### Out-of-scope
- 27 subtype (instincts)
- Levels of Health(Riso-Hudson, 저작권) 측정
- 공식 RHETI·HSS 점수화

---

## 2. 공개 API

```typescript
// packages/engine-enneagram/src/index.ts

export const EngineId = "enneagram" as const;
export const SchemaVersion = "1.0.0";

export interface EnneagramInput {
  answers: Array<{ questionId: string; value: 1|2|3|4|5|6|7 }>;
  instrumentVersion: string;     // 예: "ennea-inst@1"
}

export interface EnneagramOutput {
  primaryType: EnneaType;        // 1~9
  wing: {
    side: "left" | "right" | "none";
    type: EnneaType | null;      // Primary의 왼/오른 이웃
    strength: number;            // 0~1
  };
  typeScores: Record<EnneaType, number>;      // 정규화 0~100
  triad: {
    body: number;                 // 1·8·9 합
    heart: number;                // 2·3·4 합
    head: number;                 // 5·6·7 합
    dominant: "body" | "heart" | "head";
  };
  arrows: {
    integrationTo: EnneaType;     // 통합 방향
    disintegrationTo: EnneaType;  // 분열 방향
  };
  reliability: {
    consistency: number;
    decisiveness: number;
    flags: ReliabilityFlag[];
  };
  ambiguity?: {
    nearTies: Array<{ type: EnneaType; score: number }>;
    note: string;
  };
  trace: EnneagramTrace;
}

export type EnneaType = 1|2|3|4|5|6|7|8|9;
```

---

## 3. 문항셋 설계

### 3.1 규모
- 총 **81문** (각 유형 9문 × 9 유형). 약 12~14분 소요.
- 축소판 54문(각 6문) 버전도 준비 — 사용자 선택지.

### 3.2 척도
- 7점 Likert (동일 UX 일관성).

### 3.3 문항 저술 원칙
- 유형별 **핵심 동기**(core motivation)와 **기본 두려움**(basic fear)을 간접 탐지 문장으로.
- 유형 특성을 **행동이 아닌 내적 동기**로 묘사 (같은 행동이 다른 유형에서 다른 이유로 나올 수 있기 때문).
- 9 유형 각각에 대해 긍정(정방향) 6문 + 역방향 3문 균형.

### 3.4 샘플 문항
```
T1-01: "옳다고 믿는 기준에 스스로 벗어나면 스스로 심하게 나무랍니다." (+1)
T2-03: "타인에게 필요한 사람이 되는 것이 나의 큰 기쁨 중 하나입니다." (+2)
T3-02: "성과가 없는 하루가 계속되면 불안해집니다."                      (+3)
T4-05: "남들과 다른 길을 걷고 있다는 감각이 나를 이루는 일부입니다."     (+4)
T5-07: "사람들과 오래 어울리면 에너지가 빠르게 소진됩니다."              (+5)
T6-04: "최악의 시나리오를 먼저 떠올리는 편이 안전하다고 느낍니다."       (+6)
T7-02: "가능성이 열려 있지 않으면 갇힌 느낌이 듭니다."                   (+7)
T8-06: "불편한 진실이라도 감추지 않고 드러내는 편이 낫다고 봅니다."       (+8)
T9-01: "갈등이 커지는 것만큼은 피하고 싶습니다."                         (+9)
```

(최종 81문은 `packages/engine-enneagram/src/instruments/v1.ts`)

---

## 4. 채점 알고리즘

```typescript
function scoreTypes(answers: AnswersIndexed): Record<EnneaType, number> {
  const raw: Record<EnneaType, number> = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  for (const item of INSTRUMENT.items) {
    const v = answers[item.id];       // 1~7
    const centered = v - 4;           // -3~+3
    raw[item.type] += centered * item.direction;
  }
  // 0~100 정규화
  const maxAbs = itemsPerType * 3;
  const normalized = {} as Record<EnneaType, number>;
  for (const t of ENNEA_TYPES) {
    normalized[t] = Math.max(0, ((raw[t] + maxAbs) / (2 * maxAbs)) * 100);
  }
  return normalized;
}

function primaryAndWing(scores: Record<EnneaType, number>) {
  const sorted = Object.entries(scores).sort((a,b) => b[1]-a[1]);
  const primary = Number(sorted[0][0]) as EnneaType;
  const neighbors = wingNeighbors(primary);  // 예: T1 → [9, 2]
  const [left, right] = neighbors;
  const wing = scores[left] >= scores[right]
    ? { side: "left", type: left }
    : { side: "right", type: right };
  const strength =
    Math.abs(scores[wing.type] - scores[otherOf(wing.type, neighbors)]) / 100;
  return { primary, wing: { ...wing, strength } };
}
```

### 4.1 윙 이웃 테이블
```
1 → 9, 2
2 → 1, 3
3 → 2, 4
4 → 3, 5
5 → 4, 6
6 → 5, 7
7 → 6, 8
8 → 7, 9
9 → 8, 1
```

### 4.2 통합/분열 방향
| Primary | Integration(→) | Disintegration(→) |
|---|---|---|
| 1 | 7 | 4 |
| 2 | 4 | 8 |
| 3 | 6 | 9 |
| 4 | 1 | 2 |
| 5 | 8 | 7 |
| 6 | 9 | 3 |
| 7 | 5 | 1 |
| 8 | 2 | 5 |
| 9 | 3 | 6 |

(공용 에니어그램 순환 기호 기반)

---

## 5. 모호성 처리 (ambiguity)

상위 2개 유형의 점수 차가 **5점 이내**이면 `ambiguity.nearTies`에 두 유형을 담고, "이 두 유형 중 정체성에 더 가까운 쪽을 골라 해석하세요" 안내.

```typescript
if (scores[top1] - scores[top2] < 5) {
  ambiguity = {
    nearTies: [{ type: top1, score: ... }, { type: top2, score: ... }],
    note: "두 유형의 경향이 비슷합니다. 자기 동기를 더 잘 설명하는 쪽을 선택해 보시기를 권합니다."
  };
}
```

---

## 6. 트라이어드 계산

```typescript
body = scores[1] + scores[8] + scores[9];
heart = scores[2] + scores[3] + scores[4];
head = scores[5] + scores[6] + scores[7];
dominant = argmax({body, heart, head});
```

[73-visual-language](./73-visual-language-v0.1.md) C6 (Enneagram 9각형)에서 시각화.

---

## 7. Trace

```typescript
export interface EnneagramTrace {
  instrumentVersion: string;
  itemCount: number;
  perTypeContributions: Record<EnneaType, Array<{
    itemId: string;
    delta: number;
  }>>;
  rawScores: Record<EnneaType, number>;
  normalizedScores: Record<EnneaType, number>;
  wingSelection: { leftScore: number; rightScore: number; chosen: "left"|"right" };
  triad: { body: number; heart: number; head: number };
}
```

---

## 8. 테스트 전략

### 8.1 유닛
- `wingNeighbors` 순환 테이블 전수
- 극단 응답(전부 7) → 각 문항 type에 맞춰 해당 유형 점수 모두 상한
- 모두 4(중립) → 모든 type 점수 동점 → primary tie-break(낮은 번호 우선, confidence=low)

### 8.2 골든 테스트
- 9 유형별 대표 응답 프로필 9개 → 각각 해당 유형 판정
- 윙 경계 케이스: 윙 좌/우 점수 동점 → 낮은 번호 쪽으로 fallback (트레이스에 기록)

### 8.3 속성 기반
- 모든 응답에서 `primaryType`이 항상 1~9
- `triad.dominant`가 body/heart/head 중 하나
- `arrows`에 반드시 타 유형 2개 존재(자기 자신 아님)

---

## 9. 해석 레이어 연결

에니어그램은 다른 엔진보다 **자기 동기·두려움** 관련 깊이 있는 키워드를 많이 제공 → [20-interpretation-layer](./20-interpretation-layer-v0.1.md)의 "깊은 자아" 섹션 주요 소스.

교차 인사이트에서는:
- 사주의 일간(日干) 특성 + 에니어그램 primary
- 자미두수 명궁 주성 + 에니어그램 트라이어드
- Goldschneider 원형의 growthAxis + 에니어그램 통합 방향

의 조합 룰을 사용 (세부는 20-interpretation).

---

## 10. 오픈 이슈

1. 자체 저술 9 유형 한글명 — "개혁가/조력자/성취가..." 등 널리 알려진 용어 중 저작권 이슈 없는 표현만 선택 가능. 별도 워크시트에서 확정.
2. 윙 표기: "1w9", "1w2" 관용 표기 vs 전문 표기 — UI에서는 "1 유형, 9 쪽으로 기울어짐"처럼 풀어쓰기.
3. Instincts(sp/so/sx) v2 도입 타이밍 — 피드백으로 결정.

---

## 11. 변경 이력

| 날짜 | 버전 | 변경 | 담당 |
|---|---|---|---|
| 2026-04-20 | 0.1 | 최초 작성 | 솔로 |
