---
doc: 12-engine-goldschneider-spec
version: 0.1
status: draft
owner: 1인 풀스택
depends_on:
  - 01-data-model-v0.1
scope: Goldschneider 48주 원형(Archetype) 엔진
---

# 12. Goldschneider 48주 엔진 스펙

> Gary Goldschneider · Joost Elffers의 *The Secret Language of Birthdays* (국내 『내 생일 책』류) 체계. 태양 황경 기준으로 1년을 48개의 **주(week)**로 나눈 뒤, 각 주에 원형(archetype)을 부여한다. 이 엔진은 생년월일로부터 해당 주와 원형 키워드를 결정론적으로 반환한다.

---

## 0. 법적·IP 주의 (반드시 먼저 읽을 것)

- Goldschneider의 48주 분할(날짜 구간)은 **점성학 황도 기반 규칙**이므로 사실(fact) 영역. 분할 자체는 엔진이 독립 계산 가능.
- 각 주의 **고유 명칭**(예: "The Week of the Dreamer")과 서술문은 **저작권** 영역. 그대로 사용 금지.
- **우리의 접근:**
  1. 48주 구간 계산은 자체 알고리즘으로 수행(저작권 회피).
  2. 각 주에 부여할 **원형 이름**은 자체 네이밍(한국어 + 추상 영문)으로 재작성.
  3. 키워드·해석문도 **완전 자체 저술**. 원서의 어휘를 번역·각색해 사용하지 않는다.
- v1 출시 전 상표·저작권 이슈 재확인 필요 — 법무 검토.

---

## 1. 책임 범위

### In-scope
- 양력 생년월일로 48주 중 어느 주에 속하는지 판정
- 해당 주의 자체 원형 ID 반환
- 전/후 주와의 거리(경계일인지 여부) 트레이스
- 점성학적 별자리(sun sign) + 데케이트(decanate) 부가 정보

### Out-of-scope
- 월·수·목·금·토·천왕·해왕·명왕성 등 개별 행성 배치 (별도 엔진 제외, 원서에서만 다룸)
- 호로스코프 차트 생성
- 동양 절기 기준 변환 (별개 엔진인 만세력이 담당)

---

## 2. 48주 분할 원리

태양이 황도 12궁 각각에 약 30일 머물며, 이를 4주 × 12궁 = 48주로 분할한다. 각 별자리는:
- **Cusp(경계) 주:** 전 별자리와 다음 별자리 경계 (예: 物 Aries-Taurus Cusp, 4월 19일 ~ 4월 24일)
- **Week I:** 별자리 초반
- **Week II:** 별자리 중반
- **Week III:** 별자리 후반

12궁 × 4주(Cusp·I·II·III) = 48주.

실제 날짜는 해마다 ±1일 변동(태양의 궁 진입 시각 때문). v1에서는 **고정 달력 규칙**(원서가 제공하는 전통 분할) 사용 — 사용자 입장에서 99% 일치, 경계일은 UI에서 "경계에 가깝습니다" 안내.

---

## 3. 공개 API

```typescript
// packages/engine-goldschneider/src/index.ts

export const EngineId = "goldschneider" as const;
export const SchemaVersion = "1.0.0";

export interface GoldschneiderInput {
  solarDate: { year: number; month: number; day: number };
}

export interface GoldschneiderOutput {
  archetypeId: ArchetypeId;            // 1~48 (우리 내부 번호)
  weekKey: string;                     // e.g. "aries-i", "aries-taurus-cusp"
  sunSign: SunSign;                    // "aries" | ... | "pisces"
  decanate: 1 | 2 | 3;                 // 별자리 내 데케이트
  isCusp: boolean;
  cuspDetail?: {
    previousSign: SunSign;
    nextSign: SunSign;
    daysFromCenter: number;            // 경계 중심에서 ±
  };
  trace: GoldschneiderTrace;
}
```

---

## 4. 48주 매핑 테이블

`src/tables/weeks.ts`에 상수로 보유. 각 엔트리:

```typescript
export interface WeekDefinition {
  archetypeId: number;          // 1~48
  weekKey: string;
  startMonth: number;           // 시작일(양력)
  startDay: number;
  endMonth: number;
  endDay: number;
  sunSign: SunSign;
  decanate: 1 | 2 | 3;
  isCusp: boolean;
}
```

### 4.1 연도 경계 처리
- 일부 주는 12월 말 ~ 1월 초를 걸친다 (예: 마지막 주 = 12/26 ~ 1/1). 엔진 내부에서 연도를 감안해 분기.
- 2월 29일(윤일)은 Pisces Week II(혹은 해당 주) 경계에 배치. 테이블에 명시.

### 4.2 확장: 시간 기반 정밀 모드 (v2)
v1은 날짜만 입력. v2에서 시간·위치까지 받아 실제 태양 황경을 계산해 경계일을 정밀하게 결정.

---

## 5. 자체 원형 네이밍 전략

48개 원형 이름은 다음 조건을 만족해야 한다:
1. **저작권 회피:** Goldschneider 원서의 단어·문구 직접 차용 금지.
2. **한글 + 영문 병기** (예: `결심자 / The Resolver`).
3. **단정 톤 지양:** "~한 사람"보다 "~의 경향이 강한 원형".
4. **브랜드 일관성:** [70-brand-identity](./70-brand-identity-v0.1.md)의 평서형 종결·단정 회피 규칙 준수.

### 네이밍 워크숍 프로세스
1. 각 주의 전통 점성학 특성(태양·데케이트·고전 해석) 요약 → 3~5 키워드
2. 키워드 클러스터링 → 대표 개념 선정
3. 순수 사전(한국어 + 라틴어 · 그리스어 어원)에서 후보어 도출
4. 타이포·발음 검수 → 최종 확정
5. 법무 검토 (원서와 유사도 체크)

**세부 네이밍 48개는 별도 워크시트(Google Sheet)에서 관리 — 이 문서의 범위 밖.** v1 스펙 확정 전 완료.

---

## 6. 원형 데이터 스키마

각 원형에는 해석 레이어가 소비할 **데이터 카드** 하나가 따라온다.

```typescript
export interface ArchetypeCard {
  id: number;                        // 1~48
  weekKey: string;
  nameKo: string;                    // 예: "관찰자"
  nameEn: string;                    // 예: "The Observer"
  tagline: string;                   // 1줄 요약 (50자 내외)
  traits: {
    strengths: string[];             // 3~5개 (단어/단구)
    tensions: string[];              // 3~5개
    growthAxis: string;              // 1문장
  };
  compatibilityHints: {
    resonatesWith: number[];         // 같은 원형 체계 내 ID 참조
    clashesWith: number[];
  };
  narrativeSeeds: string[];          // 해석 레이어 템플릿의 변수 소스
}
```

- 모든 문자열은 **자체 저술** (원서 번역/각색 금지).
- `narrativeSeeds`는 단문으로 5~10개 구비. 해석 레이어가 이 중 톤에 맞는 2~3개를 골라 엮는다.

---

## 7. 계산 로직

```typescript
export function compute(input: GoldschneiderInput): GoldschneiderOutput {
  const { year, month, day } = input.solarDate;
  const ordinal = toOrdinalDay(month, day);       // 1~366
  const leap = isLeapYear(year);

  // 1) 48주 테이블 룩업 (연도 경계 걸침 처리)
  const week = findWeekContainingDate(month, day, leap);

  // 2) cusp 여부 및 중심일에서 거리
  const cuspDetail = week.isCusp
    ? computeCuspDetail(week, month, day)
    : undefined;

  // 3) 트레이스
  const trace: GoldschneiderTrace = {
    inputDate: `${year}-${pad(month)}-${pad(day)}`,
    matchedWeekKey: week.weekKey,
    archetypeId: week.archetypeId,
    sunSign: week.sunSign,
    decanate: week.decanate,
    isCusp: week.isCusp,
    tableVersion: WEEKS_TABLE_VERSION,
  };

  return {
    archetypeId: week.archetypeId,
    weekKey: week.weekKey,
    sunSign: week.sunSign,
    decanate: week.decanate,
    isCusp: week.isCusp,
    cuspDetail,
    trace,
  };
}
```

순수 함수. 어떠한 I/O도 없음.

---

## 8. 테스트 전략

### 8.1 유닛
- 1년 366일(윤일 포함) 모든 날짜가 **정확히 한 개** 주에 속함 (전수 테스트)
- 경계일 (`isCusp=true`) 날짜는 `cuspDetail` 반드시 존재
- 원형 ID는 1~48 범위 내

### 8.2 골든 테스트
- 원서 / 공개된 Goldschneider 생일 사전 류에서 **날짜 ↔ 주 구분** 부분만 20 케이스 추출(분할 규칙 검증용)
- 경계 확인: 1월 1일, 2월 29일, 12월 31일 등 특이일

### 8.3 속성 기반
- 임의 날짜 → 반환된 `weekKey`가 테이블에 존재
- 반환된 `decanate`가 1~3 범위
- `isCusp=true` ↔ `cuspDetail` 존재

---

## 9. 궁합(양방향 참조)

`ArchetypeCard.compatibilityHints`는 같은 체계 내에서의 "공명·갈등" 힌트다. 교차 인사이트 엔진(Interpretation Layer)은 이 정보를 **서양 체계 내 궁합**으로 사용하고, 사주/자미두수의 동양 궁합과 **섞지 않는다** (카테고리를 분리 표기).

---

## 10. 오픈 이슈

1. **경계일 엄밀화 (v2):** 황경 기준 실제 태양 위치 계산 도입. 천문 라이브러리(suncalc, astronomy-engine) 검토.
2. **원형 이름 워크샵 완료 기한:** P0 종료(2026-05-03)까지 48개 확정 필요.
3. **콜드스타트 이슈:** 원형 카드(해석용)가 채워지지 않으면 엔진은 동작해도 리포트가 비어 보임 → 해석 레이어 스펙에 더미 카드 로직 필요.

---

## 11. 변경 이력

| 날짜 | 버전 | 변경 | 담당 |
|---|---|---|---|
| 2026-04-20 | 0.1 | 최초 작성 | 솔로 |
