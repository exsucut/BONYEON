---
doc: 13-engine-mbti-spec
version: 0.1
status: draft
owner: 1인 풀스택
depends_on:
  - 01-data-model-v0.1
scope: 4축 성향 자가 진단 엔진 (MBTI 계열)
---

# 13. 4축 성향 엔진 스펙 (MBTI 계열, 자체 문항)

> 본 제품은 **MBTI® 공식 검사를 사용하지 않는다**. MBTI는 Myers-Briggs Foundation의 등록 상표이며 공식 검사(MBTI® Step I/II)는 라이선스가 필요하다. 우리는 같은 **4축 이분법**(에너지 방향·인식·판단·생활양식)을 **자체 저술한 문항**으로 측정하여 16 유형 중 하나를 제시한다.

---

## 0. IP·브랜딩 전략

- 제품 화면·문서에서의 표기:
  - 1차 노출: **"4축 성향 분석"** 또는 브랜드 네이밍 (예: `ARCHE Persona`)
  - 보조 설명: "MBTI와 유사한 16유형 이분법 체계를 기반으로 자체 제작한 검사입니다. 공식 MBTI® 검사와 다릅니다."
- 코드·DB의 `engineId`는 `mbti`(내부 식별용)로 유지하되, UI 레이블은 다르게.
- 16 유형 코드(예: INTJ) 표기는 **사실·공용 약어**로 판단하여 사용 가능. 단 "MBTI" 단어 자체는 제품명·홍보 문구에서 최소화.

---

## 1. 책임 범위

### In-scope
- 자체 문항(60~80문) 기반 4축 점수화
- 16 유형 중 1개 판정 (경계값 혼합형 안내 포함)
- 각 축의 원점수·정규화 점수·신뢰도 산출
- 재응답 권장 조건 검출 (일관성 점수 낮음 등)

### Out-of-scope
- 공식 MBTI® Step I/II 채점
- 기능 스택(dominant/auxiliary/tertiary/inferior) 심화 분석 (v2 고려)

---

## 2. 공개 API

```typescript
// packages/engine-mbti/src/index.ts

export const EngineId = "mbti" as const;
export const SchemaVersion = "1.0.0";

export interface MbtiInput {
  answers: Array<{ questionId: string; value: 1 | 2 | 3 | 4 | 5 | 6 | 7 }>;
  instrumentVersion: string;   // 문항셋 버전 (예: "mbti-inst@1")
}

export interface MbtiOutput {
  code: string;                // "INTJ", "ESFP" 등
  axes: {
    ei: AxisResult;            // Extraversion (+) ↔ Introversion (-)
    sn: AxisResult;            // Sensing ↔ iNtuition
    tf: AxisResult;            // Thinking ↔ Feeling
    jp: AxisResult;            // Judging ↔ Perceiving
  };
  reliability: {
    consistency: number;       // 0~1 (일관성)
    decisiveness: number;      // 0~1 (4,5,6 선택 비율)
    flags: ReliabilityFlag[];  // "low_consistency" | "too_neutral" | ...
  };
  boundaryNotice?: {
    axis: "ei" | "sn" | "tf" | "jp";
    distance: number;          // 중심에서 떨어진 정도
    alternateCode: string;     // 반대 쪽으로 뒤집힌 코드
  };
  trace: MbtiTrace;
}

export interface AxisResult {
  rawScore: number;            // 축별 합산 원점수
  normalized: number;          // -100 ~ +100
  pole: "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
  confidence: "low" | "medium" | "high";
}
```

---

## 3. 문항셋 설계

### 3.1 규모
- **총 60문** (v1). 축당 15문. 설문 소요 ~10분 (1문 10초).
- 시간 여유에 따라 80문 버전도 준비 (축당 20문, 정확도 상향).

### 3.2 척도
- **7점 Likert** (1=매우 반대 ~ 7=매우 동의). 4가 중립.
- 4(중립) 남용 방지를 위해 UI에서 "애매하면 가까운 쪽"으로 안내.

### 3.3 반대 극 역채점
- 각 축에 **정방향 문항과 역방향 문항을 5:5로** 배치. 일관성 계산에 사용.

### 3.4 문항 저술 원칙
- 직무·학력·연령 중립적 표현
- 한국어 자연스러운 구어체 (존대형 평서체, [70-brand-identity](./70-brand-identity-v0.1.md) 톤 규칙 준수)
- **부정적 자기인식 유발 금지** ("당신은 ~이 부족하다" 류 금지)
- 1문 1개념 (이중 질문 금지: "~하고 ~한가?" ✗)
- 사회적 바람직성(social desirability) 편향 최소화 (둘 다 매력적인 선택으로 균형)

### 3.5 샘플 문항
> 실제 60개는 `packages/engine-mbti/src/instruments/v1.ts`에 둔다. 샘플 몇 개:

```
EI-03: 혼자 있는 시간이 길어지면 에너지가 회복됩니다.         (I+)
EI-08: 새로운 모임에 가면 오히려 기운이 납니다.               (E+)
SN-05: 글을 읽을 때 구체적인 예시가 있어야 이해가 잘됩니다.   (S+)
SN-11: 일어나지 않은 일을 상상하며 시간을 보내는 일이 잦습니다. (N+)
TF-02: 결정을 내릴 때 관련 사람의 감정을 가장 먼저 고려합니다. (F+)
TF-14: 논리가 맞지 않으면 감정이 상해도 짚고 넘어가는 편입니다. (T+)
JP-01: 계획이 어긋나면 일단 불편함을 느낍니다.                 (J+)
JP-09: 가능성이 열려 있는 상태를 오래 유지하는 편입니다.       (P+)
```

---

## 4. 채점 알고리즘

```typescript
function scoreAxis(
  axis: AxisId,
  answers: AnswersIndexed
): AxisResult {
  const items = INSTRUMENT.items.filter(i => i.axis === axis);
  // items: [{id, direction: +1 or -1, pole: "E"|"I"|...}]

  let sum = 0;
  for (const item of items) {
    const v = answers[item.id];             // 1~7
    const centered = v - 4;                 // -3 ~ +3
    sum += centered * item.direction;       // 역문항은 direction = -1
  }

  const maxAbs = items.length * 3;          // 이론적 최대
  const normalized = (sum / maxAbs) * 100;  // -100 ~ +100

  const pole = normalized >= 0 ? positivePole(axis) : negativePole(axis);
  const confidence =
    Math.abs(normalized) >= 30 ? "high" :
    Math.abs(normalized) >= 10 ? "medium" : "low";

  return { rawScore: sum, normalized, pole, confidence };
}
```

코드 조합:
```typescript
const code = `${axes.ei.pole}${axes.sn.pole}${axes.tf.pole}${axes.jp.pole}`;
// "INTJ", "ESFP" 등
```

---

## 5. 일관성·신뢰도

### 5.1 Consistency
축마다 정방향·역방향 문항을 페어링 → 페어 간 반응 차이 평균. 차이가 작을수록 일관성 ↑.

```typescript
consistency = 1 - (avgPairDifference / maxPossibleDifference);
// 0 ~ 1
```

### 5.2 Decisiveness
중립(4) 응답의 비율. 4 비율이 50%를 넘으면 `too_neutral` 플래그.

### 5.3 플래그 → 사용자 안내
- `low_consistency` (< 0.5): "응답이 다소 엇갈립니다. 결과 해석에 유의하세요."
- `too_neutral` (> 0.5 중립 비율): "애매한 응답이 많아 정확도가 낮을 수 있습니다. 다시 해보시는 것을 권합니다."
- 두 플래그 동시 → 재응답 강권(모달).

---

## 6. 경계값 처리

정규화 점수의 절대값이 **10 미만**이면 `boundaryNotice`를 채워 반환.

```typescript
if (Math.abs(ei.normalized) < 10) {
  boundaryNotice = {
    axis: "ei",
    distance: ei.normalized,
    alternateCode: flipAxis(code, "ei"),   // "INTJ" ↔ "ENTJ"
  };
}
```

UI는 "E/I 경계에 가깝습니다. 상황에 따라 반대 성향도 나타날 수 있습니다."와 대안 코드를 함께 표시.

---

## 7. Trace

```typescript
export interface MbtiTrace {
  instrumentVersion: string;
  itemCount: number;
  axisBreakdown: Record<AxisId, {
    itemIds: string[];
    polarityContribution: Array<{ itemId: string; delta: number }>;
    rawScore: number;
    normalized: number;
  }>;
  reliability: { consistency: number; decisiveness: number };
}
```

[73-visual-language](./73-visual-language-v0.1.md) C7 MBTI 4축 바에서 `axisBreakdown`을 소비해 "이 문항이 이 축을 얼마나 밀었는지" 시각화 가능.

---

## 8. 테스트 전략

### 8.1 유닛
- 모든 문항의 `direction` 정합성 검증 (pole 일치)
- 극단 응답(전부 1, 전부 7) → 정규화 -100/+100
- 전부 4 → 0, pole은 규칙상 tie-break(알파벳 앞쪽 = "I","N","F","P" 채택하되 confidence="low")

### 8.2 골든 테스트
- 저자(내가) 직접 다수 응답 셋 → 각 16 유형별 대표 응답 16개 제작 → 해당 코드 반환
- 경계값 케이스: 일부러 어느 한 축이 `normalized ∈ [-9,9]`가 되도록 제작 → `boundaryNotice` 발생

### 8.3 속성 기반
- 모든 답이 같은 값이면 `normalized`가 해당 방향 최대/0/최소 중 하나
- 임의 응답에서도 `code.length === 4`

---

## 9. 문항 관리

- `packages/engine-mbti/src/instruments/v1.ts`에 **코드 안에 JSON 상수**로 내장 (CDN 왕복 회피, 결정론성 보장).
- 문항 추가/교체 시 반드시 **새 instrumentVersion**으로. 기존 응답은 구 버전으로 보관.
- i18n은 v2. v1은 ko-KR only.

---

## 10. 프라이버시

- 응답 원본은 `app.mbti_responses.answers_json`에 저장.
- 사용자 삭제 시 answers는 원본째 삭제. 집계 통계는 익명화된 뒤에만 저장.
- 고용·보험 등 제3자에게 공유 금지 문구 UI 전면 노출.

---

## 11. 오픈 이슈

1. 16 유형 이름(한글)을 어떻게 부를지 — 원전의 "Architect/Defender" 류 명칭을 쓸지, 자체 네이밍을 쓸지. 저작권 이슈 확인 후 결정. 후보: 자체 네이밍 권장.
2. 재응답 쿨다운 정책 — 같은 날 여러 번 응답하면 결과가 바뀌는 피로가 커짐. 7일 쿨다운 UX 고려.
3. 기능 스택(Fe/Ti 등)을 v1에서 다룰지 — 현재 OUT-of-scope.

---

## 12. 변경 이력

| 날짜 | 버전 | 변경 | 담당 |
|---|---|---|---|
| 2026-04-20 | 0.1 | 최초 작성 | 솔로 |
