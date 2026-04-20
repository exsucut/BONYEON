# 명리 분석 플랫폼 — Layer 0 만세력 엔진 기술 스펙

**Version:** 0.1 (initial)
**Status:** Draft for implementation
**Audience:** 풀스택 개발자, 명리 도메인 전문가, QA 엔지니어
**Scope:** Layer 0 (만세력 엔진) + MVP 원국 화면 연동 범위

---

## 0. 문서 정보

이 문서는 명리 분석 웹 플랫폼의 **기반층(Layer 0)** 에 해당하는 만세력 엔진의 기술 스펙이다. 상위 층(관계 분석, 용신, 격국, 해석 등)은 전부 이 엔진이 뽑은 여덟 글자와 시간 메타데이터에 의존하므로, 이 문서의 정확성과 구현 완결도가 프로젝트 전체 품질의 하한선을 결정한다.

> **설계 원칙.** 순수함수 중심. 사이드이펙트 없음. 같은 입력 → 항상 같은 출력. 모든 중간 계산은 `trace` 필드로 외부에 노출하여, 사용자·상담가·개발자가 결과의 근거를 언제든 펼쳐볼 수 있어야 한다.

---

## 목차

- [1. 개요와 목표](#1-개요와-목표)
- [2. 입력 사양](#2-입력-사양)
- [3. 출력 사양](#3-출력-사양)
- [4. 파이프라인 아키텍처](#4-파이프라인-아키텍처)
- [5. 천문 계산 모듈 (Hybrid)](#5-천문-계산-모듈-hybrid)
- [6. 한국 달력 모듈](#6-한국-달력-모듈)
- [7. 사주 기둥 계산](#7-사주-기둥-계산)
- [8. 관례 모듈](#8-관례-모듈)
- [9. Public API](#9-public-api)
- [10. 경계 케이스 카탈로그](#10-경계-케이스-카탈로그)
- [11. 검증 전략](#11-검증-전략)
- [12. 성능 및 보안](#12-성능-및-보안)
- [13. 모듈 디렉터리 구조](#13-모듈-디렉터리-구조)
- [14. MVP 개발 마일스톤](#14-mvp-개발-마일스톤)
- [부록](#부록)

---

## 1. 개요와 목표

### 1.1 이 엔진이 하는 일

단일 함수로 축약하면 다음과 같다:

```
ManseryeokInput → ManseryeokOutput
```

입력은 "생년월일시 + 출생지 + 관례 선택", 출력은 "사주 여덟 글자 + 지장간 + 달력 정보 + 계산 추적(trace)". 이것이 전부다.

### 1.2 Non-Goals (이 층이 하지 않는 것)

- 십신 계산 (→ Layer 2)
- 합충형파해 (→ Layer 2)
- 신살 (→ Layer 4)
- 용신·격국 (→ Layer 5)
- 해석 텍스트 생성 (→ Layer 7)

Layer 0은 "데이터가 정확한가"만 책임진다. 의미 부여는 상위 층의 일이다.

### 1.3 정확도 목표 (검수 합격선)

| 항목 | 목표 | 검증 기준 |
|---|---|---|
| 24절기 시각 | ±30초 | KASI 공식 데이터 |
| 양력↔음력 변환 | 100% 일치 | KASI 음력 테이블 1900–2100 |
| 한국 표준시 적용 | 100% 정확 | 표준시 3기 + DST 12구간 모두 커버 |
| 일주 (시주 포함) | 점신/원광만세력과 99.5%+ 일치 | 500건 비교 테스트 |
| 진태양시 | ±5초 | Spencer EOT 공식 |
| 성능 | <50ms per chart | 모던 브라우저(Chrome/Safari) |

### 1.4 용어 정의

| 용어 | 정의 |
|---|---|
| 절(節) | 24절기 중 월주를 바꾸는 12개 (입춘·경칩·청명·입하·망종·소서·입추·백로·한로·입동·대설·소한) |
| 중기(中氣) | 24절기 중 월주를 바꾸지 **않는** 12개 (우수·춘분·곡우·소만·하지·대서·처서·추분·상강·소설·동지·대한) |
| 진태양시 | 지방 실제 태양시 (경도 보정 + 균시차 반영) |
| 자시 관례 | 23~01시 구간의 일주·시주 처리 방식 |
| JDN | Julian Day Number (기원전 4714.11.24 정오 기준 누적 일수) |
| EOT | Equation of Time (균시차) |

---

## 2. 입력 사양

### 2.1 ManseryeokInput 타입

```typescript
interface ManseryeokInput {
  /** 달력 일자 */
  date: {
    year: number;   // 1900 ~ 2100
    month: number;  // 1 ~ 12
    day: number;    // 1 ~ 31 (해당 월에 유효한 범위)
  };

  /** 출생 시각. null이면 시주 없이 생성 */
  time: {
    hour: number;   // 0 ~ 23
    minute: number; // 0 ~ 59
  } | null;

  /** 달력 종류 */
  calendarType: 'solar' | 'lunar';

  /** 음력 입력 시 윤달 여부. calendarType='lunar'일 때만 유의미 */
  lunarLeap?: boolean;

  /** 출생지 위치 */
  location: {
    longitude: number;        // 동경 +, 서경 - (degrees)
    latitude: number;         // 북위 +, 남위 - (degrees)
    cityName?: string;        // UI 표시용 (예: "서울특별시")
    timezoneOverride?: number; // UTC 오프셋(분 단위). 해외 출생 등 특수 케이스
  };

  /** 계산 관례 선택 */
  conventions: {
    jasi: 'split' | 'unified' | 'offset30';
    yearBoundary: 'ipchun';  // v0.1은 입춘만. 동지설은 v2 이후
    useTrueSolarTime: boolean;
  };
}
```

### 2.2 필드 상세

**`date`** — 연 1900–2100 범위를 기본 지원. 경계 밖은 정확도가 떨어지므로 Meeus 폴백에 의존하며 `trace.warnings`에 경고 추가.

**`time: null`** — 시주 없음. 출력의 `pillars.hour`는 null이 되고, `hiddenStems.hour`도 null. 상위 층에서 시주 의존 해석은 스킵해야 한다.

**`calendarType`** — "음력 1990년 10월 23일" 같은 입력은 내부에서 양력으로 변환 후 모든 계산 진행. 변환 결과도 `calendar` 필드로 함께 반환.

**`lunarLeap`** — 한국 음력은 19년에 약 7번 윤달이 낀다. 1990년에는 윤5월이 있었다. 음력 입력 시 반드시 명시. 생략되면 "일반 달" 가정하고 `trace.warnings`에 기록.

**`location.longitude`** — 진태양시 계산의 핵심. 서울 126.9780, 부산 129.0756, 제주 126.5312 등 주요 도시 프리셋 제공 권장.

**`conventions.jasi`**:
- `'unified'`: 23:00–00:59 모두 다음 날 자시로 간주 (현대 한국 주류)
- `'split'`: 23:00–23:59는 전일 야자시, 00:00–00:59는 당일 조자시 (고전)
- `'offset30'`: 23:30을 기준으로 전환 (진태양시 평균 근사, 점신 표시 방식)

**`conventions.useTrueSolarTime`**: true면 경도+EOT 보정 후 시주 판정. false면 KST 그대로 사용.

### 2.3 유효성 검증

```typescript
function validateInput(input: ManseryeokInput): ValidationResult {
  const errors: string[] = [];

  if (input.date.year < 1850 || input.date.year > 2150) {
    errors.push('Year out of supported range (1850–2150)');
  }
  if (input.date.month < 1 || input.date.month > 12) {
    errors.push('Invalid month');
  }
  if (!isValidDayOfMonth(input.date)) {
    errors.push('Invalid day for month/year');
  }
  if (input.time && (input.time.hour < 0 || input.time.hour > 23)) {
    errors.push('Invalid hour');
  }
  if (Math.abs(input.location.longitude) > 180) {
    errors.push('Invalid longitude');
  }
  if (input.calendarType === 'lunar' && input.lunarLeap === undefined) {
    // 경고로 강등 (에러 아님)
  }

  return { valid: errors.length === 0, errors };
}
```

---

## 3. 출력 사양

### 3.1 ManseryeokOutput 타입

```typescript
interface ManseryeokOutput {
  /** 사주 네 기둥 */
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar | null;
  };

  /** 지장간 (각 지지별 [초기, 중기?, 정기] + 일수) */
  hiddenStems: {
    year: HiddenStem[];
    month: HiddenStem[];
    day: HiddenStem[];
    hour: HiddenStem[] | null;
  };

  /** 달력 정보 */
  calendar: {
    solar: string;    // ISO 8601 (예: "1990-12-09T13:00:00+09:00")
    lunar: { year: number; month: number; day: number; isLeap: boolean };
    dayOfWeek: number; // 0=일요일 ~ 6=토요일
  };

  /** 공망 (일주 기준 + 연주 기준 각각) */
  kongmang: {
    byDay: [Branch, Branch];
    byYear: [Branch, Branch];
  };

  /** 납음오행 */
  napeum: {
    year: string;
    month: string;
    day: string;
    hour: string | null;
  };

  /** 계산 추적 — 투명성의 핵심 */
  trace: ManseryeokTrace;
}

interface Pillar {
  stem: Stem;    // { index: 0-9, char: "甲"..."癸", korean: "갑"..."계" }
  branch: Branch; // { index: 0-11, char: "子"..."亥", korean: "자"..."해" }
}

interface HiddenStem {
  stem: Stem;
  type: 'early' | 'middle' | 'main'; // 초기 / 중기 / 정기
  days: number;                       // 월률분야 일수
}
```

### 3.2 ManseryeokTrace — 투명성 필드

계산의 모든 중간값을 노출한다. UI에서 "왜 이렇게 계산됐나요?" 버튼을 누르면 이 객체 전체가 펼쳐진다.

```typescript
interface ManseryeokTrace {
  /** 시간 처리 단계별 값 */
  timeProcessing: {
    userInput: string;              // 사용자 입력 그대로 (ISO)
    afterCalendarConversion: string; // 음→양 변환 후
    afterTimezoneNormalization: string; // 표준시 정리 후
    afterDSTRollback: string;       // 서머타임 제거 후
    trueSolarTime: string;          // 진태양시 (옵션 켰을 때)
  };

  /** 시간대 판정 내역 */
  timezone: {
    meridian: number;   // 127.5 | 135
    offset: number;     // +480 | +540 (분 단위)
    periodName: string; // "1912-1954 (UTC+9, 일본 표준시)"
  };

  /** 서머타임 적용 여부 */
  dst: {
    applied: boolean;
    period?: { name: string; start: string; end: string; offset: number };
  };

  /** 진태양시 보정 내역 */
  trueSolarCorrection: {
    enabled: boolean;
    longitudeCorrectionMinutes: number; // 예: -32.09
    equationOfTimeMinutes: number;      // 예: +6.6
    totalCorrectionMinutes: number;
  };

  /** 절기 위치 */
  solarTerms: {
    previousMajor: { name: string; time: string };  // 직전 절(節)
    nextMajor: { name: string; time: string };
    solarLongitudeAtBirth: number; // 0~360°
    dataSource: 'KASI' | 'Meeus';
  };

  /** 각 기둥 결정 근거 */
  pillarDecisions: {
    year: {
      ipchunTime: string;
      birthRelativeToIpchun: 'before' | 'after';
      computedYearIndex: number;
    };
    month: {
      governingTerm: string; // 어느 절이 이 월을 지배하는지
      wuhutun: string;        // 적용된 오호둔 규칙
    };
    day: {
      jdn: number;
      referenceAnchor: { date: string; pillar: string };
      jasiAdjustment: 'none' | 'rolled-forward' | 'kept';
    };
    hour: {
      jasiConvention: string;
      wusodun: string;
    };
  };

  /** 경고 및 주의사항 */
  warnings: string[];
}
```

---

## 4. 파이프라인 아키텍처

```
┌──────────────────────────────────────────────────────────────┐
│ 1. 입력 정규화      Validate & canonicalize                   │
├──────────────────────────────────────────────────────────────┤
│ 2. 양력 변환        Lunar → Solar (if needed)                 │
├──────────────────────────────────────────────────────────────┤
│ 3. 시간대 결정      Detect active meridian (127.5 or 135)      │
├──────────────────────────────────────────────────────────────┤
│ 4. 서머타임 롤백    Subtract DST offset if in DST period      │
├──────────────────────────────────────────────────────────────┤
│ 5. 진태양시 보정    Longitude correction + EOT (if enabled)   │
├──────────────────────────────────────────────────────────────┤
│ 6. 절기 위치 확정   Find bracketing major terms (節)          │
├──────────────────────────────────────────────────────────────┤
│ 7. 연주 계산        Ipchun-based year index + stem/branch     │
├──────────────────────────────────────────────────────────────┤
│ 8. 월주 계산        Month branch from 절 → stem via 오호둔     │
├──────────────────────────────────────────────────────────────┤
│ 9. 일주/시주 계산   JDN → day pillar; hour pillar via 오서둔   │
├──────────────────────────────────────────────────────────────┤
│ 10. 지장간/공망/납음 부가 정보 추가                             │
├──────────────────────────────────────────────────────────────┤
│ 11. Trace 조립 및 반환                                          │
└──────────────────────────────────────────────────────────────┘
```

**각 단계는 독립 모듈**로 구현한다. 단위 테스트가 용이하고, 버그 발생 시 어느 단계에서 틀렸는지 즉시 특정 가능하다.

---

## 5. 천문 계산 모듈 (Hybrid)

### 5.1 Hybrid 전략 개요

```typescript
async function findSolarTerm(utcTime: Date): Promise<SolarTermContext> {
  // 1순위: KASI 내장 테이블
  if (KASI_RANGE.covers(utcTime)) {
    return lookupFromKASI(utcTime);
  }
  // 2순위: Meeus 알고리즘
  return computeWithMeeus(utcTime);
}
```

**KASI 커버 범위:** 1900-01-01 ~ 2100-12-31 (목표)

### 5.2 KASI 데이터 내장 형식

한국천문연구원(KASI, https://astro.kasi.re.kr)이 공표하는 절기 데이터를 JSON으로 내장한다.

```json
{
  "year": 1990,
  "terms": [
    { "name": "소한", "zhName": "小寒", "utc": "1990-01-05T16:33:00Z", "longitude": 285 },
    { "name": "대한", "zhName": "大寒", "utc": "1990-01-20T09:55:00Z", "longitude": 300 },
    { "name": "입춘", "zhName": "立春", "utc": "1990-02-04T04:14:00Z", "longitude": 315 },
    { "name": "우수", "zhName": "雨水", "utc": "1990-02-19T00:14:00Z", "longitude": 330 }
    // ... 나머지 20개
  ]
}
```

**데이터 획득 절차:**

1. KASI 천문우주지식정보 포털에서 연도별 절기 데이터 크롤링 (또는 공식 API 사용)
2. 로컬 스크립트로 JSON 정규화
3. 배포 시 빌드 타임에 번들에 포함 (약 200년 × 24항목 × 64바이트 ≈ 300KB, gzip 후 <50KB)
4. 런타임에 바이너리 검색으로 즉시 조회

**주의:** KASI 시각은 기본 KST로 공표되는 경우가 많다. 내장 시점에 UTC로 정규화한다.

### 5.3 Meeus 폴백 알고리즘

KASI 범위 밖이거나 테이블에 누락이 있을 때의 폴백. Jean Meeus의 *Astronomical Algorithms* 2nd ed. 중 Chapter 25 (Solar Coordinates), Chapter 27 (Equation of Time) 구현.

```typescript
/** 주어진 UTC 시각의 태양 황경 (도, 0~360) */
function solarEclipticLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525; // 율리우스 세기

  // 평균 황경
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;

  // 평균 근점 이각
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mrad = M * Math.PI / 180;

  // 중심차 (이심 보정)
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
          + 0.000289 * Math.sin(3 * Mrad);

  // 진황경 (True longitude)
  const trueLon = L0 + C;

  // 겉보기 황경 (Apparent longitude) — 장동/광행차 간이 보정
  const omega = 125.04 - 1934.136 * T;
  const apparentLon = trueLon - 0.00569 - 0.00478 * Math.sin(omega * Math.PI / 180);

  return ((apparentLon % 360) + 360) % 360;
}
```

**절기 역탐색** (특정 황경에 도달하는 UTC 시각 찾기): 뉴턴법 또는 이분법. 일 단위로 근사 → 분 단위로 수렴.

```typescript
function findTermByLongitude(targetLon: number, approxJD: number): number {
  let jd = approxJD;
  for (let i = 0; i < 10; i++) {
    const currentLon = solarEclipticLongitude(jd);
    const diff = normalizeAngle(targetLon - currentLon);
    if (Math.abs(diff) < 0.00001) break; // ~1초 이내
    jd += diff * 365.2422 / 360;         // 선형 근사 이동
  }
  return jd;
}
```

**예상 정확도:** 1800–2200년 범위에서 ±30초 이내. KASI와 비교 회귀 테스트로 검증.

### 5.4 균시차 (Equation of Time)

Spencer 1971 공식 — 계산 부담 적고 ±10초 정확도.

```typescript
/** 주어진 날짜의 균시차 (분 단위) */
function equationOfTime(dayOfYear: number): number {
  const B = (2 * Math.PI * (dayOfYear - 81)) / 364;
  const E = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  return E; // minutes
}
```

더 정확한 값이 필요하면 Meeus Chapter 28 구현 (±1초 정확도, 계산 비용 약 2배).

---

## 6. 한국 달력 모듈

### 6.1 한국 표준시 이력 테이블

```typescript
interface TimezonePeriod {
  start: string;    // ISO UTC
  end: string;      // ISO UTC
  meridian: number; // degrees East
  offsetMinutes: number;
  name: string;
}

const KOREA_TIMEZONE_HISTORY: TimezonePeriod[] = [
  {
    start: '1908-04-01T00:00:00+08:30',
    end:   '1911-12-31T23:59:59+08:30',
    meridian: 127.5,
    offsetMinutes: 510, // +8:30
    name: '대한제국 대한표준시 (127.5°E)',
  },
  {
    start: '1912-01-01T00:00:00+09:00',
    end:   '1954-03-20T23:59:59+09:00',
    meridian: 135,
    offsetMinutes: 540, // +9:00
    name: '일본 표준시 (135°E)',
  },
  {
    start: '1954-03-21T00:00:00+08:30',
    end:   '1961-08-09T23:59:59+08:30',
    meridian: 127.5,
    offsetMinutes: 510,
    name: '대한민국 표준시 (127.5°E) — 이승만 정부',
  },
  {
    start: '1961-08-10T00:00:00+09:00',
    end:   '2999-12-31T23:59:59+09:00',
    meridian: 135,
    offsetMinutes: 540,
    name: '일본 표준시 재환원 (135°E) — 박정희 정부',
  },
];
```

**구현 시 반드시 실제 공식 관보·법령으로 재검증.** 1954년 3월 21일 0시와 1961년 8월 10일 0시 (현지 시각 기준) 경계 처리에 주의.

### 6.2 서머타임 테이블 (잠정)

```typescript
interface DSTPeriod {
  year: number;
  startLocal: string; // 표준시 기준
  endLocal: string;
  offsetMinutes: 60;  // 한국은 모두 +1시간
  sourceNote: string;
}

const KOREA_DST_PERIODS: DSTPeriod[] = [
  { year: 1948, startLocal: '1948-06-01T00:00', endLocal: '1948-09-13T00:00', offsetMinutes: 60, sourceNote: '잠정. 재검증 필요' },
  { year: 1949, startLocal: '1949-04-03T00:00', endLocal: '1949-09-11T00:00', offsetMinutes: 60, sourceNote: '잠정' },
  { year: 1950, startLocal: '1950-04-01T00:00', endLocal: '1950-09-10T00:00', offsetMinutes: 60, sourceNote: '잠정' },
  { year: 1951, startLocal: '1951-05-06T00:00', endLocal: '1951-09-09T00:00', offsetMinutes: 60, sourceNote: '잠정' },
  { year: 1955, startLocal: '1955-05-05T00:00', endLocal: '1955-09-09T00:00', offsetMinutes: 60, sourceNote: '잠정' },
  { year: 1956, startLocal: '1956-05-20T00:00', endLocal: '1956-09-30T00:00', offsetMinutes: 60, sourceNote: '잠정' },
  { year: 1957, startLocal: '1957-05-05T00:00', endLocal: '1957-09-22T00:00', offsetMinutes: 60, sourceNote: '잠정' },
  { year: 1958, startLocal: '1958-05-04T00:00', endLocal: '1958-09-21T00:00', offsetMinutes: 60, sourceNote: '잠정' },
  { year: 1959, startLocal: '1959-05-03T00:00', endLocal: '1959-09-20T00:00', offsetMinutes: 60, sourceNote: '잠정' },
  { year: 1960, startLocal: '1960-05-01T00:00', endLocal: '1960-09-18T00:00', offsetMinutes: 60, sourceNote: '잠정' },
  { year: 1987, startLocal: '1987-05-10T02:00', endLocal: '1987-10-11T03:00', offsetMinutes: 60, sourceNote: '잠정' },
  { year: 1988, startLocal: '1988-05-08T02:00', endLocal: '1988-10-09T03:00', offsetMinutes: 60, sourceNote: '잠정' },
];
```

> ⚠️ **중요:** 위 표의 시각은 여러 2차 출처에서 수집한 잠정값이다. 프로덕션 배포 전에 기상청·국가기록원·공식 관보 1차 자료로 모든 날짜·시각 재검증이 필수다. 특히 1955–1960년 구간은 자료마다 표기가 미묘하게 다르다.

**서머타임 롤백 로직:**

```typescript
function rollbackDST(localTime: Date): { standardTime: Date; applied: DSTPeriod | null } {
  for (const period of KOREA_DST_PERIODS) {
    if (isWithin(localTime, period.startLocal, period.endLocal)) {
      const standardTime = new Date(localTime.getTime() - period.offsetMinutes * 60_000);
      return { standardTime, applied: period };
    }
  }
  return { standardTime: localTime, applied: null };
}
```

**경계일 특이 케이스:** DST 종료일 새벽(예: 1988-10-09 02:00–02:59)은 한 시간이 두 번 존재한다. 사용자 입력이 "첫 번째 2시"인지 "두 번째 2시"인지 구분할 수 없으므로, UI에서 이 구간을 선택한 사용자에게 모호성 경고를 띄우고 기본값(표준시 해석)을 채택한다.

### 6.3 음양력 변환

```typescript
interface LunarDate {
  year: number;
  month: number;  // 1~12
  day: number;
  isLeap: boolean;
}

function lunarToSolar(lunar: LunarDate): Date { /* ... */ }
function solarToLunar(solar: Date): LunarDate { /* ... */ }
```

**데이터 소스:** KASI 음력 데이터 1900–2100. 각 연도의 윤달 위치와 각 월의 일수(29 또는 30) 테이블로 내장.

```typescript
interface LunarYear {
  year: number;
  leapMonth: number | null; // 0이면 윤달 없음, 1-12면 해당 월 다음에 윤달
  monthDays: number[];       // 길이 12 또는 13 (윤달 포함 시)
  yearStart: string;         // 설날 양력 (예: "1990-01-27")
}
```

용량: 200년 × 약 100바이트 ≈ 20KB (gzip 후 <5KB).

---

## 7. 사주 기둥 계산

### 7.1 연주 계산 — 입춘 기준

```typescript
function yearPillar(utcTime: Date, location: Location): { pillar: Pillar; trace: any } {
  const year = getYear(utcTime);

  // 해당 연도의 입춘 시각을 찾음
  const ipchunThisYear = findTerm('입춘', year);
  const ipchunLastYear = findTerm('입춘', year - 1);

  // 출생 시각이 입춘 전이면 전년도 간지 사용
  const effectiveYear = utcTime < ipchunThisYear ? year - 1 : year;

  // 간지 인덱스 공식 (1984 = 甲子年 기준)
  const stemIndex = ((effectiveYear - 1984) % 10 + 10) % 10;
  const branchIndex = ((effectiveYear - 1984) % 12 + 12) % 12;

  return {
    pillar: { stem: STEMS[stemIndex], branch: BRANCHES[branchIndex] },
    trace: {
      ipchunTime: ipchunThisYear.toISOString(),
      birthRelativeToIpchun: utcTime < ipchunThisYear ? 'before' : 'after',
      effectiveYear,
    },
  };
}
```

### 7.2 월주 계산 — 12절 + 오호둔

**월지 결정:**

| 월지 | 지배 절기 | 절기 황경 |
|---|---|---|
| 寅(1) | 입춘 | 315° |
| 卯(2) | 경칩 | 345° |
| 辰(3) | 청명 | 15° |
| 巳(4) | 입하 | 45° |
| 午(5) | 망종 | 75° |
| 未(6) | 소서 | 105° |
| 申(7) | 입추 | 135° |
| 酉(8) | 백로 | 165° |
| 戌(9) | 한로 | 195° |
| 亥(10) | 입동 | 225° |
| 子(11) | 대설 | 255° |
| 丑(12) | 소한 | 285° |

*주의:* 월지는 **중기가 아닌 절**로만 전환된다. 예컨대 처서(8/23경)는 중기이므로 월지를 바꾸지 않는다.

**월간 결정 — 오호둔(五虎遁):**

```typescript
const WUHUTUN: Record<number, number> = {
  0: 2, // 甲 → 丙寅月
  1: 4, // 乙 → 戊寅月
  2: 6, // 丙 → 庚寅月
  3: 8, // 丁 → 壬寅月
  4: 0, // 戊 → 甲寅月
  5: 2, // 己 → 丙寅月 (甲과 동일)
  6: 4, // 庚 → 戊寅月
  7: 6, // 辛 → 庚寅月
  8: 8, // 壬 → 壬寅月
  9: 0, // 癸 → 甲寅月
};

function monthStem(yearStemIndex: number, monthBranchIndex: number): number {
  // 寅月(branch=2)의 간 인덱스
  const inYueStem = WUHUTUN[yearStemIndex];
  // 寅月부터 현재 월지까지의 오프셋
  const offset = (monthBranchIndex - 2 + 12) % 12;
  return (inYueStem + offset) % 10;
}
```

**공식 축약:** `월간 = (연간×2 + 월지_from_인) mod 10`, 여기서 `월지_from_인 = (월지_인덱스 - 2 + 12) mod 12`.

### 7.3 일주 계산 — JDN 기반

```typescript
function dayPillar(utcTime: Date): { pillar: Pillar; trace: any } {
  // JDN (정수) 계산
  const jdn = toJulianDayNumber(utcTime);

  // 검증된 기준점: 2000-01-01 00:00 UTC 이후 정오 = 丁酉日 (JDN 2451545)
  // 丁(stem=3), 酉(branch=9)
  const refJDN = 2451545;
  const refStem = 3;
  const refBranch = 9;

  const delta = jdn - refJDN;
  const stemIndex = ((delta + refStem) % 10 + 10) % 10;
  const branchIndex = ((delta + refBranch) % 12 + 12) % 12;

  return {
    pillar: { stem: STEMS[stemIndex], branch: BRANCHES[branchIndex] },
    trace: {
      jdn,
      referenceAnchor: { date: '2000-01-01', pillar: '丁酉' },
    },
  };
}
```

> **기준 앵커 검증 필수.** 2000-01-01의 일주는 점신·만세력플러스·KASI에서 교차 확인. 구현 전 QA가 직접 확인할 것.

**자시 조정:** 23시 이후 출생에서 `jasi === 'unified'`면 일자를 하루 앞으로(+1일) 당겨 일주 계산. `'split'`이면 그대로. `'offset30'`이면 23:30 이후만 +1일.

### 7.4 시주 계산 — 자시 관례 + 오서둔

**시지 결정:**

| 시지 | 표준 시각 범위 | 30분 오프셋 범위 |
|---|---|---|
| 子 | 23:00–00:59 | 23:30–01:29 |
| 丑 | 01:00–02:59 | 01:30–03:29 |
| 寅 | 03:00–04:59 | 03:30–05:29 |
| 卯 | 05:00–06:59 | 05:30–07:29 |
| 辰 | 07:00–08:59 | 07:30–09:29 |
| 巳 | 09:00–10:59 | 09:30–11:29 |
| 午 | 11:00–12:59 | 11:30–13:29 |
| 未 | 13:00–14:59 | 13:30–15:29 |
| 申 | 15:00–16:59 | 15:30–17:29 |
| 酉 | 17:00–18:59 | 17:30–19:29 |
| 戌 | 19:00–20:59 | 19:30–21:29 |
| 亥 | 21:00–22:59 | 21:30–23:29 |

**시간 결정 — 오서둔(五鼠遁):**

```typescript
const WUSODUN: Record<number, number> = {
  0: 0, // 甲日 → 甲子時
  1: 2, // 乙日 → 丙子時
  2: 4, // 丙日 → 戊子時
  3: 6, // 丁日 → 庚子時
  4: 8, // 戊日 → 壬子時
  5: 0, // 己日 → 甲子時
  6: 2, // 庚日 → 丙子時
  7: 4, // 辛日 → 戊子時
  8: 6, // 壬日 → 庚子時
  9: 8, // 癸日 → 壬子時
};

function hourStem(dayStemIndex: number, hourBranchIndex: number): number {
  const ziStemIndex = WUSODUN[dayStemIndex];
  return (ziStemIndex + hourBranchIndex) % 10;
}
```

**공식 축약:** `시간 = (일간×2 + 시지_인덱스) mod 10`.

### 7.5 지장간 (월률분야)

```typescript
const HIDDEN_STEMS_TABLE: Record<number, HiddenStem[]> = {
  0: [ // 子
    { stem: STEMS[8], type: 'early',  days: 10 }, // 壬
    { stem: STEMS[9], type: 'main',   days: 20 }, // 癸
  ],
  1: [ // 丑
    { stem: STEMS[9], type: 'early',  days: 9  }, // 癸
    { stem: STEMS[7], type: 'middle', days: 3  }, // 辛
    { stem: STEMS[5], type: 'main',   days: 18 }, // 己
  ],
  2: [ // 寅
    { stem: STEMS[4], type: 'early',  days: 7  }, // 戊
    { stem: STEMS[2], type: 'middle', days: 7  }, // 丙
    { stem: STEMS[0], type: 'main',   days: 16 }, // 甲
  ],
  3: [ // 卯
    { stem: STEMS[0], type: 'early',  days: 10 }, // 甲
    { stem: STEMS[1], type: 'main',   days: 20 }, // 乙
  ],
  4: [ // 辰
    { stem: STEMS[1], type: 'early',  days: 9  }, // 乙
    { stem: STEMS[9], type: 'middle', days: 3  }, // 癸
    { stem: STEMS[4], type: 'main',   days: 18 }, // 戊
  ],
  5: [ // 巳
    { stem: STEMS[4], type: 'early',  days: 7  }, // 戊
    { stem: STEMS[6], type: 'middle', days: 7  }, // 庚
    { stem: STEMS[2], type: 'main',   days: 16 }, // 丙
  ],
  6: [ // 午
    { stem: STEMS[2], type: 'early',  days: 10 }, // 丙
    { stem: STEMS[5], type: 'middle', days: 9  }, // 己
    { stem: STEMS[3], type: 'main',   days: 11 }, // 丁
  ],
  7: [ // 未
    { stem: STEMS[3], type: 'early',  days: 9  }, // 丁
    { stem: STEMS[1], type: 'middle', days: 3  }, // 乙
    { stem: STEMS[5], type: 'main',   days: 18 }, // 己
  ],
  8: [ // 申
    { stem: STEMS[4], type: 'early',  days: 7  }, // 戊
    { stem: STEMS[8], type: 'middle', days: 7  }, // 壬
    { stem: STEMS[6], type: 'main',   days: 16 }, // 庚
  ],
  9: [ // 酉
    { stem: STEMS[6], type: 'early',  days: 10 }, // 庚
    { stem: STEMS[7], type: 'main',   days: 20 }, // 辛
  ],
  10: [ // 戌
    { stem: STEMS[7], type: 'early',  days: 9  }, // 辛
    { stem: STEMS[3], type: 'middle', days: 3  }, // 丁
    { stem: STEMS[4], type: 'main',   days: 18 }, // 戊
  ],
  11: [ // 亥
    { stem: STEMS[4], type: 'early',  days: 7  }, // 戊
    { stem: STEMS[0], type: 'middle', days: 7  }, // 甲
    { stem: STEMS[8], type: 'main',   days: 16 }, // 壬
  ],
};
```

**검산:** 각 지지의 일수 합은 30.

### 7.6 공망 계산

```typescript
function kongmang(dayPillar: Pillar): [Branch, Branch] {
  // 60갑자 순번 = stem*6 + branch 관계에서 유도
  // 갑자 순(1-10) → 공망 戌亥
  // 갑술 순(11-20) → 공망 申酉
  // ...
  const sunIndex = getSunIndex(dayPillar);
  return SUN_KONGMANG_TABLE[sunIndex];
}
```

순중공망 표는 부록 G 참조.

### 7.7 납음오행

60갑자 각각에 배당된 납음. 2개의 간지마다 같은 납음 공유 (예: 甲子·乙丑 = 해중금). 테이블 조회만 하면 된다. 부록 H 참조.

---

## 8. 관례 모듈

### 8.1 자시 관례 처리

```typescript
type JasiConvention = 'unified' | 'split' | 'offset30';

interface JasiDecision {
  adjustedDayShift: 0 | 1;     // 일주 계산용 날짜 시프트
  hourBranchIndex: number;     // 시지 인덱스
}

function resolveJasi(
  hour: number,
  minute: number,
  convention: JasiConvention
): JasiDecision {
  switch (convention) {
    case 'unified':
      // 23:00~00:59 모두 자시. 23시대는 다음 날로 간주.
      if (hour === 23) return { adjustedDayShift: 1, hourBranchIndex: 0 };
      if (hour === 0) return { adjustedDayShift: 0, hourBranchIndex: 0 };
      return standardHourBranch(hour);

    case 'split':
      // 23시대 = 야자시 (일주는 전일 유지, 시주는 다음날 子時 기준)
      if (hour === 23) return { adjustedDayShift: 0, hourBranchIndex: 0 }; // 일주는 전일, 시주는 자시로
      // ※ 주의: 야자시에서 시간 계산은 다음날의 일간 기준? 학파에 따라 다름
      if (hour === 0) return { adjustedDayShift: 0, hourBranchIndex: 0 };
      return standardHourBranch(hour);

    case 'offset30':
      // 23:30 기준 전환
      const totalMin = hour * 60 + minute;
      if (totalMin >= 23 * 60 + 30) return { adjustedDayShift: 1, hourBranchIndex: 0 };
      if (totalMin >= 0 && totalMin < 30) return { adjustedDayShift: 0, hourBranchIndex: 0 };
      // 나머지 구간은 offset된 표 사용
      return offset30HourBranch(totalMin);
  }
}
```

**split 관례의 야자시 시간 계산 쟁점.** "야자시에서 시주는 전일의 시간을 따르는가, 다음날의 시간을 따르는가?" 학파마다 다르다. v0.1은 **다음날 일간 기준**을 기본으로 하되, 설정으로 토글 제공.

### 8.2 진태양시 보정

```typescript
function applyTrueSolarTime(
  standardTime: Date,
  location: Location,
  meridian: number
): { trueSolarTime: Date; trace: any } {
  // 1. 경도 보정
  const longitudeDiff = location.longitude - meridian;
  const longitudeCorrectionMin = longitudeDiff * 4; // 1° = 4분

  // 2. 균시차
  const dayOfYear = getDayOfYear(standardTime);
  const eotMin = equationOfTime(dayOfYear);

  // 3. 최종 보정
  const totalCorrection = longitudeCorrectionMin + eotMin;
  const trueSolarTime = new Date(standardTime.getTime() + totalCorrection * 60_000);

  return {
    trueSolarTime,
    trace: {
      longitudeCorrectionMinutes: longitudeCorrectionMin,
      equationOfTimeMinutes: eotMin,
      totalCorrectionMinutes: totalCorrection,
    },
  };
}
```

**서울 예시 (1990-12-09 13:00 KST):**
- 경도 보정: (126.978 - 135) × 4 = -32.088분
- 균시차 (12월 9일경): +6.5분
- 합계: -25.588분 → 진태양시 12:34:25

---

## 9. Public API

### 9.1 메인 함수

```typescript
/**
 * 만세력 엔진의 단일 진입점.
 * 입력은 순수 객체, 출력도 순수 객체. 사이드이펙트 없음.
 */
export function computeManseryeok(input: ManseryeokInput): ManseryeokOutput {
  validateInputOrThrow(input);
  const ctx = initContext(input);

  const solarDate = normalizeToSolar(ctx);
  const kst = applyKoreanTimezone(solarDate, ctx);
  const afterDST = rollbackDST(kst, ctx);
  const trueSolar = input.conventions.useTrueSolarTime
    ? applyTrueSolarTime(afterDST, ctx)
    : afterDST;

  const terms = findSolarTermsAround(trueSolar.utcTime, ctx);

  const year = computeYearPillar(trueSolar, terms, ctx);
  const month = computeMonthPillar(trueSolar, terms, year, ctx);
  const day = computeDayPillar(trueSolar, ctx);
  const hour = input.time ? computeHourPillar(trueSolar, day, ctx) : null;

  return assembleOutput({ year, month, day, hour, ctx });
}
```

### 9.2 보조 함수 (선택적 export)

```typescript
export function lunarToSolar(lunar: LunarDate): Date;
export function solarToLunar(solar: Date): LunarDate;
export function findSolarTerm(name: SolarTermName, year: number): Date;
export function listSolarTerms(year: number): SolarTerm[];
export function calculateSixtyCycleIndex(pillar: Pillar): number; // 0~59
export function getNapeum(pillar: Pillar): string;
```

### 9.3 에러 모델

```typescript
class ManseryeokError extends Error {
  code: 'INVALID_INPUT' | 'OUT_OF_RANGE' | 'MISSING_DATA' | 'AMBIGUOUS_DST';
  details: Record<string, any>;
}
```

**AMBIGUOUS_DST:** DST 종료일 겹치는 1시간 구간 입력 시. UI에서 캐치하여 사용자에게 선택 요구.

---

## 10. 경계 케이스 카탈로그

**모든 항목이 회귀 테스트로 존재해야 한다.**

### 10.1 시간 경계

- 입춘 시각 ±5분, ±1분, ±10초 전후 (연주 경계)
- 각 12절 시각 ±5분 (월주 경계)
- 22:59 / 23:00 / 23:29 / 23:30 / 23:59 / 00:00 / 00:29 / 00:30 / 00:59 / 01:00 (자시 경계 × 관례 3종 = 30 케이스)
- 윤초 포함일 (UTC leap seconds)

### 10.2 표준시 변경 경계

- 1908-04-01 00:00 전후
- 1912-01-01 00:00 전후
- 1954-03-21 00:00 전후
- 1961-08-10 00:00 전후

### 10.3 서머타임 경계

- 각 DST 시작일 시작시각 ±30분
- 각 DST 종료일 중복 1시간 (모호성 테스트)
- 1955-05-05 00:00 시작 구간 (다른 해와 다른 시각)
- 1988-10-09 02:00 종료 (서울올림픽 직후)

### 10.4 음양력 변환 경계

- 각 윤달 해의 윤달 첫째 날과 마지막 날
- 설날 (양력 날짜가 1월 말~2월 중순으로 변동)
- 1900년 1월 1일 (양력 달력 시작)
- 각 연도 대한~입춘 사이 음력 말일 (연주 판정 충돌 지점)

### 10.5 지리적 경계

- 국내: 서울, 부산, 목포, 강릉 (경도 약 3도 차이)
- 해외: 뉴욕, 런던, 시드니 (타임존 오버라이드)
- 적도 부근 (EOT 크게 변동 없음)
- 남반구 (계절 반대지만 명리 이론상 별도 처리 없음 — `trace.warnings`에 노트 추가)

### 10.6 시주 없음

- `time: null` 입력 → 출력의 `pillars.hour`, `hiddenStems.hour` 모두 null
- 상위 층에서 시주 의존 항목 스킵 (신살 일부, 시주 공망 등)

---

## 11. 검증 전략

### 11.1 Golden Dataset 스키마

```typescript
interface GoldenTestCase {
  id: string;
  description: string;          // 케이스 설명
  input: ManseryeokInput;
  expected: Partial<ManseryeokOutput>; // 부분 검증 가능
  sources: string[];            // 검증 출처 (점신, KASI, 명리서 등)
  tags: string[];               // 'dst', 'timezone-change', 'lunar-leap' 등
}
```

**파일 구성:**

```
tests/golden/
├── jumsin-500.json           # 점신 교차검증 500건
├── kasi-terms-100y.json      # KASI 절기 100년치
├── historical-figures.json   # 역사 인물 검증
├── boundary-cases.json       # 경계 케이스 수동 작성
└── property-seeds.json       # property 테스트 시드
```

### 11.2 Property-based Tests (fast-check 등)

```typescript
import fc from 'fast-check';

test('60일 주기 항등성', () => {
  fc.assert(fc.property(
    fc.date({ min: new Date(1900, 0), max: new Date(2100, 0) }),
    (date) => {
      const a = dayPillarOnly(date);
      const b = dayPillarOnly(addDays(date, 60));
      return pillarsEqual(a, b);
    }
  ));
});

test('60년 주기 항등성 (연주)', () => { /* ... */ });

test('2000-01-01 앵커 불변성', () => {
  const result = computeManseryeok(buildInput('2000-01-01T12:00:00+09:00'));
  expect(result.pillars.day).toEqual({ stem: { char: '丁' }, branch: { char: '酉' } });
});
```

### 11.3 CI 회귀 테스트 매트릭스

| 테스트 스위트 | 건수 | 허용 오차 | 빈도 |
|---|---|---|---|
| Unit (각 모듈) | ~200 | 0 | 모든 커밋 |
| Golden (점신 비교) | 500 | 0 (불일치 시 사유 기록) | 모든 PR |
| Golden (KASI 절기) | 2400 | ±30초 | 일일 |
| Boundary cases | ~150 | 0 | 모든 PR |
| Property-based | 10,000 random | 0 | 모든 PR |
| End-to-end (API) | ~50 | 0 | 모든 PR |

### 11.4 불일치 프로토콜

점신과 결과가 다를 때:

1. `trace`를 자세히 검토하여 우리 계산이 맞는지 확인
2. 같은 입력을 원광만세력/천을귀인만세력/만세력플러스에 넣어 다수결 확인
3. KASI 절기 데이터로 원칙적 정답 도출
4. 그래도 불명이면 `known-discrepancies.md`에 등재 (사용자 공개)

---

## 12. 성능 및 보안

### 12.1 성능 목표

- **Chart calculation:** <50ms on mid-range mobile device
- **Lunar↔Solar conversion:** <1ms (테이블 조회)
- **Solar term lookup:** <1ms (이분 탐색)
- **Meeus fallback:** <5ms per computation
- **Bundle size:** 엔진 + 데이터 <500KB (gzip <150KB)

### 12.2 실행 위치 — 프라이버시 우선

```
기본: 100% 클라이언트 사이드 실행
→ 생년월일·출생시·출생지 서버 전송 없음
→ 사용자가 "저장"을 명시적으로 누를 때만 서버로

API 사용자 (B2B): 서버 사이드 실행 옵션
→ 명시적 옵트인, 로그 최소화, TTL 설정 가능
```

### 12.3 캐싱

- KASI 테이블: 빌드 타임 번들링 (immutable)
- 음력 테이블: 동일
- 사용자 사주 결과: localStorage (로컬만) 또는 IndexedDB
- 서버 측: Redis, key = hash(input), TTL 24h

### 12.4 민감 정보 보호

- `ManseryeokInput`은 PII 성격을 가짐 → 로그에 직접 기록 금지
- 에러 리포팅 시 해시된 입력만 전송
- 브라우저 저장 시 기본 암호화는 하지 않음 (사용자 기기 신뢰 모델)

---

## 13. 모듈 디렉터리 구조

```
packages/manseryeok-core/
├── package.json
├── README.md
├── tsconfig.json
├── src/
│   ├── index.ts                  # public API barrel
│   ├── types.ts                  # 공용 타입 (Pillar, Stem, Branch, ...)
│   ├── constants.ts              # 60갑자, 오호둔, 오서둔 테이블
│   ├── astronomy/
│   │   ├── julian-day.ts
│   │   ├── solar-position.ts     # Meeus 알고리즘
│   │   ├── equation-of-time.ts
│   │   └── solar-terms.ts        # 절기 탐색 통합 API
│   ├── calendar/
│   │   ├── lunar-solar.ts
│   │   ├── korea-timezone.ts
│   │   └── korea-dst.ts
│   ├── pillars/
│   │   ├── year.ts
│   │   ├── month.ts
│   │   ├── day.ts
│   │   ├── hour.ts
│   │   └── hidden-stems.ts
│   ├── conventions/
│   │   ├── jasi.ts
│   │   └── true-solar-time.ts
│   ├── auxiliary/
│   │   ├── kongmang.ts
│   │   └── napeum.ts
│   ├── validation/
│   │   └── input-validator.ts
│   ├── pipeline.ts               # computeManseryeok() 오케스트레이션
│   └── data/
│       ├── kasi-solar-terms.json
│       ├── lunar-calendar.json
│       └── references.json
├── tests/
│   ├── unit/
│   │   ├── astronomy.test.ts
│   │   ├── timezone.test.ts
│   │   ├── dst.test.ts
│   │   ├── pillars.test.ts
│   │   └── ...
│   ├── integration/
│   │   └── pipeline.test.ts
│   ├── golden/
│   │   ├── runner.ts
│   │   └── data/ (위 11.1 참조)
│   └── property/
│       └── invariants.test.ts
└── scripts/
    ├── fetch-kasi-data.ts        # KASI 크롤러
    ├── generate-lunar-table.ts
    └── verify-golden.ts
```

---

## 14. MVP 개발 마일스톤

업로드된 화면(점신 수준의 원국 화면) 완성도를 목표로 한다.

### M1 · 기반 (2주)

- [ ] 타입 시스템 (`Stem`, `Branch`, `Pillar`, `ManseryeokInput/Output`)
- [ ] 60갑자·오호둔·오서둔·지장간 상수 테이블
- [ ] JDN 계산 유틸
- [ ] 입력 유효성 검증
- [ ] 단위 테스트 골격

### M2 · 천문 (3주)

- [ ] KASI 절기 데이터 크롤링 스크립트
- [ ] 내장 JSON 생성 (1900–2100)
- [ ] 이분 탐색 기반 절기 조회 API
- [ ] Meeus 알고리즘 구현
- [ ] EOT 계산
- [ ] 천문 모듈 단위 테스트 (절기 100년치 KASI 대조)

### M3 · 한국 달력 (2주)

- [ ] 표준시 이력 테이블 + 경계 처리
- [ ] DST 테이블 + 롤백 로직
- [ ] 음양력 변환 (KASI 기반)
- [ ] DST 모호성 에러 처리

### M4 · 기둥 계산 (2주)

- [ ] 연주 (입춘 기준)
- [ ] 월주 (12절 + 오호둔)
- [ ] 일주 (JDN + 기준 앵커)
- [ ] 시주 (자시 관례 3종 + 오서둔)
- [ ] 지장간·공망·납음

### M5 · 파이프라인 통합 (1주)

- [ ] `computeManseryeok()` 오케스트레이션
- [ ] `trace` 조립
- [ ] E2E 테스트

### M6 · Golden Validation (2주)

- [ ] 점신 비교 500건 (수집 + 비교 + 분석)
- [ ] 역사 인물 검증
- [ ] 경계 케이스 수동 스위트
- [ ] 불일치 조사 및 문서화

### M7 · MVP UI 연동 (3주)

- [ ] 입력 폼 (양/음력, 생년월일시, 출생지, 관례)
- [ ] 원국 표시 (업로드 이미지와 동일 레이아웃: 사주원국, 십신, 지장간, 12운성, 12신살, 공망)
- [ ] 오행 파이 차트
- [ ] `trace` 펼쳐보기 패널
- [ ] 학파별 관례 토글

**총 예상 기간:** 약 15주 (3.5개월) — 1인 풀스택 풀타임 기준. 도메인 검증자(명리 전문가) 주 5시간 협업 필요.

---

## 부록

### 부록 A · 천간 (Stems)

| Index | 한자 | 한글 | 오행 | 음양 |
|---|---|---|---|---|
| 0 | 甲 | 갑 | 목 | 양 |
| 1 | 乙 | 을 | 목 | 음 |
| 2 | 丙 | 병 | 화 | 양 |
| 3 | 丁 | 정 | 화 | 음 |
| 4 | 戊 | 무 | 토 | 양 |
| 5 | 己 | 기 | 토 | 음 |
| 6 | 庚 | 경 | 금 | 양 |
| 7 | 辛 | 신 | 금 | 음 |
| 8 | 壬 | 임 | 수 | 양 |
| 9 | 癸 | 계 | 수 | 음 |

### 부록 B · 지지 (Branches)

| Index | 한자 | 한글 | 오행 | 음양 | 월지 | 동물 |
|---|---|---|---|---|---|---|
| 0 | 子 | 자 | 수 | 양* | 11월 | 쥐 |
| 1 | 丑 | 축 | 토 | 음 | 12월 | 소 |
| 2 | 寅 | 인 | 목 | 양 | 1월 | 호랑이 |
| 3 | 卯 | 묘 | 목 | 음 | 2월 | 토끼 |
| 4 | 辰 | 진 | 토 | 양 | 3월 | 용 |
| 5 | 巳 | 사 | 화 | 음* | 4월 | 뱀 |
| 6 | 午 | 오 | 화 | 양* | 5월 | 말 |
| 7 | 未 | 미 | 토 | 음 | 6월 | 양 |
| 8 | 申 | 신 | 금 | 양 | 7월 | 원숭이 |
| 9 | 酉 | 유 | 금 | 음 | 8월 | 닭 |
| 10 | 戌 | 술 | 토 | 양 | 9월 | 개 |
| 11 | 亥 | 해 | 수 | 음* | 10월 | 돼지 |

*음양 표시에서 별표(*)는 체용(體用) 구분에서 예외 케이스. 체(體)로는 자·오·사·해가 다르게 분류되기도 함. v0.1은 위 표의 "용(用) 기준" 분류를 기본값으로 채택.

### 부록 C · 오호둔 (연간 → 寅月 간) 완전표

| 연간 | 인월 간 | 묘월 | 진월 | 사월 | 오월 | 미월 | 신월 | 유월 | 술월 | 해월 | 자월 | 축월 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 甲·己 | 丙寅 | 丁卯 | 戊辰 | 己巳 | 庚午 | 辛未 | 壬申 | 癸酉 | 甲戌 | 乙亥 | 丙子 | 丁丑 |
| 乙·庚 | 戊寅 | 己卯 | 庚辰 | 辛巳 | 壬午 | 癸未 | 甲申 | 乙酉 | 丙戌 | 丁亥 | 戊子 | 己丑 |
| 丙·辛 | 庚寅 | 辛卯 | 壬辰 | 癸巳 | 甲午 | 乙未 | 丙申 | 丁酉 | 戊戌 | 己亥 | 庚子 | 辛丑 |
| 丁·壬 | 壬寅 | 癸卯 | 甲辰 | 乙巳 | 丙午 | 丁未 | 戊申 | 己酉 | 庚戌 | 辛亥 | 壬子 | 癸丑 |
| 戊·癸 | 甲寅 | 乙卯 | 丙辰 | 丁巳 | 戊午 | 己未 | 庚申 | 辛酉 | 壬戌 | 癸亥 | 甲子 | 乙丑 |

### 부록 D · 오서둔 (일간 → 子時 간) 완전표

| 일간 | 자시 | 축시 | 인시 | 묘시 | 진시 | 사시 | 오시 | 미시 | 신시 | 유시 | 술시 | 해시 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 甲·己 | 甲子 | 乙丑 | 丙寅 | 丁卯 | 戊辰 | 己巳 | 庚午 | 辛未 | 壬申 | 癸酉 | 甲戌 | 乙亥 |
| 乙·庚 | 丙子 | 丁丑 | 戊寅 | 己卯 | 庚辰 | 辛巳 | 壬午 | 癸未 | 甲申 | 乙酉 | 丙戌 | 丁亥 |
| 丙·辛 | 戊子 | 己丑 | 庚寅 | 辛卯 | 壬辰 | 癸巳 | 甲午 | 乙未 | 丙申 | 丁酉 | 戊戌 | 己亥 |
| 丁·壬 | 庚子 | 辛丑 | 壬寅 | 癸卯 | 甲辰 | 乙巳 | 丙午 | 丁未 | 戊申 | 己酉 | 庚戌 | 辛亥 |
| 戊·癸 | 壬子 | 癸丑 | 甲寅 | 乙卯 | 丙辰 | 丁巳 | 戊午 | 己未 | 庚申 | 辛酉 | 壬戌 | 癸亥 |

### 부록 E · 지장간 완전표 (월률분야)

| 지지 | 초기 | 중기 | 정기 | 합계 |
|---|---|---|---|---|
| 子 | 壬 (10일) | — | 癸 (20일) | 30 |
| 丑 | 癸 (9일) | 辛 (3일) | 己 (18일) | 30 |
| 寅 | 戊 (7일) | 丙 (7일) | 甲 (16일) | 30 |
| 卯 | 甲 (10일) | — | 乙 (20일) | 30 |
| 辰 | 乙 (9일) | 癸 (3일) | 戊 (18일) | 30 |
| 巳 | 戊 (7일) | 庚 (7일) | 丙 (16일) | 30 |
| 午 | 丙 (10일) | 己 (9일) | 丁 (11일) | 30 |
| 未 | 丁 (9일) | 乙 (3일) | 己 (18일) | 30 |
| 申 | 戊 (7일) | 壬 (7일) | 庚 (16일) | 30 |
| 酉 | 庚 (10일) | — | 辛 (20일) | 30 |
| 戌 | 辛 (9일) | 丁 (3일) | 戊 (18일) | 30 |
| 亥 | 戊 (7일) | 甲 (7일) | 壬 (16일) | 30 |

### 부록 F · 24절기와 황경

| 월지 | 절(節) | 황경 | 중기(中氣) | 황경 |
|---|---|---|---|---|
| 寅 | 입춘(立春) | 315° | 우수(雨水) | 330° |
| 卯 | 경칩(驚蟄) | 345° | 춘분(春分) | 0° |
| 辰 | 청명(淸明) | 15° | 곡우(穀雨) | 30° |
| 巳 | 입하(立夏) | 45° | 소만(小滿) | 60° |
| 午 | 망종(芒種) | 75° | 하지(夏至) | 90° |
| 未 | 소서(小暑) | 105° | 대서(大暑) | 120° |
| 申 | 입추(立秋) | 135° | 처서(處暑) | 150° |
| 酉 | 백로(白露) | 165° | 추분(秋分) | 180° |
| 戌 | 한로(寒露) | 195° | 상강(霜降) | 210° |
| 亥 | 입동(立冬) | 225° | 소설(小雪) | 240° |
| 子 | 대설(大雪) | 255° | 동지(冬至) | 270° |
| 丑 | 소한(小寒) | 285° | 대한(大寒) | 300° |

### 부록 G · 순중공망표

| 순(旬) | 시작 | 공망 |
|---|---|---|
| 갑자순(甲子旬) | 甲子~癸酉 | 戌·亥 |
| 갑술순(甲戌旬) | 甲戌~癸未 | 申·酉 |
| 갑신순(甲申旬) | 甲申~癸巳 | 午·未 |
| 갑오순(甲午旬) | 甲午~癸卯 | 辰·巳 |
| 갑진순(甲辰旬) | 甲辰~癸丑 | 寅·卯 |
| 갑인순(甲寅旬) | 甲寅~癸亥 | 子·丑 |

### 부록 H · 납음오행 (60갑자)

| 간지 | 납음 | 간지 | 납음 |
|---|---|---|---|
| 甲子·乙丑 | 海中金 | 甲午·乙未 | 沙中金 |
| 丙寅·丁卯 | 爐中火 | 丙申·丁酉 | 山下火 |
| 戊辰·己巳 | 大林木 | 戊戌·己亥 | 平地木 |
| 庚午·辛未 | 路傍土 | 庚子·辛丑 | 壁上土 |
| 壬申·癸酉 | 劍鋒金 | 壬寅·癸卯 | 金箔金 |
| 甲戌·乙亥 | 山頭火 | 甲辰·乙巳 | 覆燈火 |
| 丙子·丁丑 | 澗下水 | 丙午·丁未 | 天河水 |
| 戊寅·己卯 | 城頭土 | 戊申·己酉 | 大驛土 |
| 庚辰·辛巳 | 白鑞金 | 庚戌·辛亥 | 釵釧金 |
| 壬午·癸未 | 楊柳木 | 壬子·癸丑 | 桑柘木 |
| 甲申·乙酉 | 泉中水 | 甲寅·乙卯 | 大溪水 |
| 丙戌·丁亥 | 屋上土 | 丙辰·丁巳 | 沙中土 |
| 戊子·己丑 | 霹靂火 | 戊午·己未 | 天上火 |
| 庚寅·辛卯 | 松柏木 | 庚申·辛酉 | 石榴木 |
| 壬辰·癸巳 | 長流水 | 壬戌·癸亥 | 大海水 |

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|---|---|---|---|
| 0.1 | 2026-04-20 | 초안 | 전체 구조 확립, Layer 0 스펙 완성 |

---

## 참고 자료

- Jean Meeus, *Astronomical Algorithms* 2nd ed., Willmann-Bell, 1998
- KASI 천문우주지식정보 https://astro.kasi.re.kr
- 심효첨, 『자평진전(子平眞詮)』
- 임철초 주, 『적천수천미(滴天髓闡微)』
- 余春台 편, 『궁통보감(窮通寶鑑)』
- 점신 앱 · 원광만세력 · 천을귀인만세력 (교차검증 참조용)

---

*"씨앗이 정확해야 계절의 해석이 바르다. 이 층은 보이지 않지만 모든 것의 바탕이다."*
