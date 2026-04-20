---
doc: 20-interpretation-layer-spec
version: 0.1
status: draft
owner: 1인 풀스택
depends_on:
  - 10-engine-manseryeok-spec-v0.1
  - 11-engine-ziweidoushu-spec-v0.1
  - 12-engine-goldschneider-spec-v0.1
  - 13-engine-mbti-spec-v0.1
  - 14-engine-enneagram-spec-v0.1
  - 01-data-model-v0.1
  - 70-brand-identity-v0.1
scope: 엔진 출력 → 사람이 읽는 해석문 변환 레이어
---

# 20. 해석 레이어 스펙

> 엔진이 내놓은 구조화된 결과를 **사람이 읽을 수 있는 한국어 문단**으로 변환한다. 핵심은 두 가지 — (1) 기계적 반복 지양(단 톤 일관성 유지), (2) 교차 인사이트(엔진 간 연결). 템플릿 우선, LLM은 요약·연결의 보조 역할.

---

## 1. 설계 원칙

1. **템플릿 우선, LLM 보조** — 기본 문장은 템플릿 조합으로, 연결·요약만 LLM. 비용·재현성·검열 리스크 관리.
2. **재현성(Reproducibility)** — 동일 입력이면 동일 출력. LLM 사용 시 seed 고정 + 캐시 + `prompt_hash` 저장.
3. **검증 가능한 톤** — 자동 린터(금지어·단정어·확률 표현) 통과 필수.
4. **운명 단정 금지** — "~될 것이다" ❌ / "~할 경향이 있습니다" ✅
5. **카테고리 분리** — 동양(사주/자미두수) vs 서양(Goldschneider/MBTI/Enneagram) 섞어 일반화하지 않는다. 교차 인사이트 섹션에서만 엮는다.

---

## 2. 리포트 섹션 구성

```
1. 개요 (overview)        — 5엔진 결과를 1~2 문단으로 요약
2. 강점 (strength)
3. 약점/이면 (weakness)
4. 관계 (relationship)
5. 기회 (opportunity)
6. 주의 (caution)
7. 교차 인사이트 (cross)  — 엔진 간 연결 통찰 3~5개
8. 엔진별 원자료 (engines) — 각 엔진 결과를 전개
```

각 섹션은 [01-data-model §5.6 interpretations](./01-data-model-v0.1.md) 테이블의 1 row로 저장.

---

## 3. 템플릿 엔진

### 3.1 개념
```typescript
interface Template {
  id: string;                     // "strength.saju.ilgan"
  version: string;
  engineId: EngineId;
  sectionId: SectionId;
  conditions: TemplateCondition[]; // 발동 조건 (일간이 甲이고 ...)
  variants: string[];              // 같은 조건에서 선택 가능한 문장 2~5개
  fillers: {
    keywords?: string[];
    qualifiers?: string[];         // "다소", "상당히", "뚜렷하게"
  };
}

type TemplateCondition =
  | { kind: "equals"; path: string; value: unknown }
  | { kind: "in"; path: string; values: unknown[] }
  | { kind: "range"; path: string; min: number; max: number };
```

### 3.2 문장 변이
같은 템플릿 ID에 variants 2~5개. 선택은 **결정론적 해시**(input_hash + template.id)로 뽑아 재현성 보장.

```typescript
function pickVariant(template: Template, inputHash: string): string {
  const idx = hash32(`${inputHash}:${template.id}`) % template.variants.length;
  return template.variants[idx];
}
```

### 3.3 조합기
1. **엔진별 매칭:** 5엔진 출력을 순회하며 조건을 만족하는 템플릿 수집.
2. **스코어링:** 각 템플릿에 우선순위 점수(조건의 구체성, 엔진 신뢰도).
3. **섹션별 상한:** 한 섹션에 템플릿 문장은 **3~5개** (피로도 관리).
4. **중복 제거:** 서로 다른 엔진이 같은 결론을 내면 "한 번만" 표현하되 근거로 둘 다 명시.

---

## 4. LLM 보조 레이어

### 4.1 역할
- 템플릿 문장들을 **자연스러운 흐름**으로 연결
- 섹션 도입/마무리 문장 생성
- 교차 인사이트 섹션에서 복수 엔진 결과를 **한 문단**으로 요약

### 4.2 사용 정책
- 모델: Anthropic Claude (기본 `claude-haiku-4-5-20251001` — 비용·속도 우선). 고난도 교차 요약은 `claude-sonnet-4-6` 옵션.
- **절대 금지:** 새 사실 추가, 엔진 출력 왜곡, 단정 확신
- **필수 준수:** 금지어 리스트(아래 §6), 평서형 종결, 수량·확률 표현
- 입력에는 원본 사용자 PII(이름·이메일·생일) **포함하지 않는다** — 추상화된 엔진 출력만.

### 4.3 시스템 프롬프트(요지)
```
당신은 한국어 성향 분석 리포트의 편집자입니다. 제공된 구조화 결과만 사용해 섹션 문단을 다듬습니다.

규칙:
- 평서형 존대 종결(-습니다/-ㅂ니다). 반말·명령형 금지.
- 단정 표현 금지: "될 것이다", "반드시", "확실히" → "~하는 경향", "~할 수 있음"
- 주어진 키워드 외의 사실을 추가하지 마십시오.
- 한자는 필요한 경우 괄호로 풀이: 比肩(비견, 같은 오행).
- 수량은 명시: "많은 사람" → "대부분", "일부", "드물게" 등으로.
- 문단당 3~5문장. 불릿 나열을 피하십시오.

입력:
{engineSummary}
{sectionId}
{templateSentences}

출력 형식: Markdown 문단만. 제목·불릿·코드블록 사용 금지.
```

### 4.4 재현성
- 요청마다 `temperature: 0` + `seed`(input_hash 파생) 고정
- 응답 캐시: `(input_hash, section_id, template_version, model_id) → content`
- `prompt_hash`를 `app.interpretations`에 저장 → 동일 입력 재호출 방지

---

## 5. 교차 인사이트(Cross Insight)

### 5.1 룰 데이터베이스
각 교차 룰은 JSON 정의:

```typescript
interface CrossRule {
  id: string;                       // "cross.saju-ennea.ilgan-triad.fire-head"
  conditions: {
    engine: EngineId;
    path: string;                   // JSONPath
    predicate: Predicate;
  }[];                              // AND
  hint: {
    categoryTag: "resonance" | "tension" | "neutral";
    sentenceId: string;             // 템플릿 ID
    priorityScore: number;          // 0~100
  };
}
```

### 5.2 초기 룰 세트 규모
- 사주 ↔ 에니어그램: 30 룰
- 사주 ↔ MBTI: 20 룰
- 자미두수 ↔ 에니어그램: 20 룰
- Goldschneider ↔ 에니어그램: 10 룰
- Goldschneider ↔ MBTI: 10 룰
- 합계 ~90 룰 (v1 목표)

### 5.3 룰 예시 (의사 코드)
```
IF saju.ilgan.element == "fire" AND ennea.triad.dominant == "head"
→ hint: "판단 속도가 빠른 불 기운과 머리 중심 사고의 조합이 뚜렷합니다.
          결정력은 강점이지만, 감정·신체 신호의 속도가 따라오지 못하면
          번아웃으로 이어질 수 있습니다."
  tag: "tension"
  priority: 70
```

### 5.4 출력
- 매칭된 룰 중 priority 상위 **5개** 선택
- resonance/tension 균형 (양쪽 최소 1개씩)
- 중복 의미 제거 (의미 벡터 유사도 > 0.8 시 낮은 priority 드롭)

---

## 6. 톤·품질 린터

자동 린터(`packages/interpretation/src/linter.ts`)가 생성된 모든 문단을 검증.

### 6.1 금지 표현 (정규식)
- 단정 미래: `될 것이(다|입니다)`, `확실히`, `반드시`, `무조건`
- 부정적 단정: `절대 안 됩니다`, `실패할 것`
- 점술적 표현: `운이 없습니다`, `흉(凶)합니다`, `대운이 꽉 막혔`
- 차별적 표현: `여자는`, `남자는` (성별 일반화)
- 1인칭: `저는`, `우리는` (리포트는 독자 대상 2인칭 없음 / 3인칭 기술형)

### 6.2 필수 충족
- 종결 어미: `-습니다`·`-ㅂ니다` 비율 > 80%
- 수량 한정어 사용: "많은/적은" 단독 사용 금지 → "대부분/일부/드물게"
- 문단 길이: 50~400자 사이

### 6.3 린터 실패 시
- 템플릿 출력: 개발자에게 알림(Sentry), 문단을 템플릿 디폴트로 fallback
- LLM 출력: 1회 재시도, 재실패 시 템플릿만 사용

---

## 7. 출력 포맷

- **Markdown**. 프런트엔드는 `react-markdown` + `rehype-sanitize`로 렌더링.
- 허용 태그: 문단(p), 강조(strong/em), 인라인 코드(code), 링크(a, rel=noopener).
- **이미지·표·헤더 H1~H2 금지** — 리포트 구조는 섹션 카드가 담당.

---

## 8. 동결(Locking) 정책

리포트가 `locked_at` 시각을 갖는 순간부터 **interpretations는 재생성 불가**.

- 엔진 `schemaVersion` 상승 / 템플릿 버전 상승이 있어도 이미 잠긴 리포트는 기존 해석 유지.
- 사용자에게는 "새 버전의 리포트를 만들 수 있습니다" 액션 노출.

---

## 9. 테스트 전략

### 9.1 유닛
- 템플릿 조건 매칭 전수 (모든 조건 타입)
- variant 선택 결정론: 같은 input_hash → 같은 variant
- 린터: 금지어 테이블 전수

### 9.2 통합
- 9 프로필(엔진 엣지 케이스 포함) × 7섹션 = 63개 리포트 섹션 블라인드 리뷰
- "3명의 서로 다른 사람에게 읽힌 정도가 1명의 동일성 인상을 주지 않아야 함" 휴먼 리뷰

### 9.3 LLM 샘플링
- 프로덕션에서 매일 100건 중 2건 샘플 → 린터 통과율·휴먼 리뷰

---

## 10. 비용 가드레일

- 템플릿만 사용 시 LLM 비용 0
- LLM 사용 비율 상한: 섹션별 최대 2회 호출, 총 리포트당 14회 이하
- 캐시 히트율 목표: > 90% (같은 입력 재호출 방지)
- 월 LLM 비용 상한 경보: $150 초과 시 Slack 알림

---

## 11. 오픈 이슈

1. LLM 제공자 단일 Anthropic 유지 vs 백업(OpenAI) 병행 — v1은 Anthropic only, 장애 대비 템플릿 fallback.
2. 교차 룰 90개가 워크로드 과함 — v1에 40개로 시작, 베타에서 확장 방향 결정.
3. 한글 어감 검증을 자동화하기 어려움 — 매 릴리스 전 수동 QA 필수.

---

## 12. 변경 이력

| 날짜 | 버전 | 변경 | 담당 |
|---|---|---|---|
| 2026-04-20 | 0.1 | 최초 작성 | 솔로 |
