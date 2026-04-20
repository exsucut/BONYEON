---
doc: 11-engine-ziweidoushu-spec
version: 0.1
status: draft
owner: 1인 풀스택
depends_on:
  - 10-engine-manseryeok-spec-v0.1
  - 01-data-model-v0.1
scope: 자미두수(紫微斗數) 명반 생성 엔진
---

# 11. 자미두수 엔진 스펙

> 자미두수(紫微斗數)는 송대 진희이(陳希夷)에게 귀속되는 명리 체계로, 12궁(宮)에 14주성(主星)을 포함한 별들을 배치해 개인의 삶의 영역별 경향을 읽는다. 이 문서는 **천반(天盤) 작성**까지의 계산 엔진 스펙이다. 해석(사람 언어) 레이어는 [20-interpretation-layer](./20-interpretation-layer-v0.1.md)에서 다룬다.

---

## 0. 용어·표기

- **십이궁(十二宮):** 命·兄弟·夫妻·子女·財帛·疾厄·遷移·奴僕·官祿·田宅·福德·父母
- **14주성:** 紫微·天機·太陽·武曲·天同·廉貞·天府·太陰·貪狼·巨門·天相·天梁·七殺·破軍
- **보좌성:** 左輔·右弼·天魁·天鉞·文昌·文曲
- **육살성:** 擎羊·陀羅·火星·鈴星·地空·地劫
- **사화(四化):** 化祿·化權·化科·化忌 (연간 기준)
- 코드에서 별 이름은 라틴 로마자 상수 (`ZIWEI`, `TIANJI` 등), 표시용은 한자+한글 병기(`紫微(자미)`).

---

## 1. 책임 범위

### In-scope
- 입력(생년월일시 + 성별 + 자시 정책)으로부터 12궁 배치
- 14주성 + 보좌성 + 살성 + 잡성(주요 일부)의 궁위 배치
- 연간 사화 계산
- 대한(大限, 10년 단위) 및 유년(流年) 기본 산출
- 신궁(身宮) 산출
- Trace: 각 별 배치의 근거(명궁 위치, 월지, 시지 계산 과정) 반환

### Out-of-scope (v1 제외)
- 유월(流月)·유일(流日)·유시(流時)
- 삼합국(三合局) 기반 고급 파생 해석
- 소산(27小限) 같은 드문 기법
- 중화권(대만/홍콩)의 유파 선택 옵션화 — 우리는 **南派(남파) 기준 단일 유파**로 출시

---

## 2. 공개 API

```typescript
// packages/engine-ziweidoushu/src/index.ts

export const EngineId = "ziweidoushu" as const;
export const SchemaVersion = "1.0.0";

export interface ZiweiInput {
  /** 만세력 엔진 결과에서 파생 — 음력 기준 년·월·일·시를 모두 받는다 */
  lunar: {
    year: number;          // 음력 연(천간지지는 별도 sexagenary 필드로 받음)
    month: number;         // 1~12, 윤달은 leapMonth로 표현
    leapMonth: boolean;
    day: number;           // 1~30
    hour: number;          // 0~23 (진태양시 적용된 시)
  };
  sexagenary: {
    yearGanZhi: GanZhi;    // 예: "甲子"
    monthGanZhi: GanZhi;
    dayGanZhi: GanZhi;
    hourGanZhi: GanZhi;
  };
  gender: "male" | "female";
}

export interface ZiweiOutput {
  palaces: Palace[];                 // 12궁 (순서: 命부터 반시계)
  bodyPalaceIndex: number;           // 身宮 위치 (0~11)
  mingPalaceIndex: number;           // 命宮 위치 (0~11)
  fiveElementJu: FiveElementJu;      // 五行局 (水二局·木三局·金四局·土五局·火六局)
  sihua: {
    lu: StarRef;    // 化祿
    quan: StarRef;  // 化權
    ke: StarRef;    // 化科
    ji: StarRef;    // 化忌
  };
  majorLimits: MajorLimit[];         // 10개 (또는 12개, 유파에 따라)
  trace: ZiweiTrace;
}

export interface Palace {
  index: number;            // 0~11
  name: PalaceName;         // "命" | "兄弟" | ...
  earthlyBranch: EarthlyBranch;
  heavenlyStem: HeavenlyStem;
  mainStars: StarInPalace[];
  auxStars: StarInPalace[];
  maleficStars: StarInPalace[];
  minorStars: StarInPalace[];
}

export interface StarInPalace {
  star: StarId;             // "ziwei" | "tianji" | ...
  brightness: Brightness;   // "廟"|"旺"|"得"|"利"|"平"|"閒"|"陷"
  sihuaMark?: "lu"|"quan"|"ke"|"ji";
}

export function compute(input: ZiweiInput): ZiweiOutput;
```

입력의 `sexagenary`는 만세력 엔진이 이미 만든 값을 재사용한다 — 자미두수 엔진은 천문 계산을 다시 하지 않는다.

---

## 3. 계산 순서

### 3.1 12궁 지지(地支) 배치
자미두수의 12궁은 고정된 **지지 순서**(寅에서 시작해 시계 반대 방향: 寅→丑→子→亥→戌→酉→申→未→午→巳→辰→卯)로 배열된다.

### 3.2 명궁(命宮) 위치
`寅`을 출발점으로 하여,
1. 생월 지지만큼 **시계방향**으로 이동 (예: 음력 3월생이면 寅 → 卯 → 辰까지 3칸)
2. 그 자리에서 생시 지지만큼 **시계반대방향**으로 이동

→ 도착한 지지가 명궁.

### 3.3 신궁(身宮) 위치
명궁과 같은 방식이지만 마지막 단계가 시계방향. 명궁과 항상 쌍을 이루며 子午·丑未·寅申·卯酉·辰戌·巳亥 축 위에 놓인다.

### 3.4 궁의 천간(五虎遁)
오호둔(五虎遁) 공식으로 **연간(年干)**에 따라 寅궁의 천간을 구하고, 나머지 궁은 순행 배치.

| 연간 | 寅궁 천간 |
|---|---|
| 甲·己 | 丙 |
| 乙·庚 | 戊 |
| 丙·辛 | 庚 |
| 丁·壬 | 壬 |
| 戊·癸 | 甲 |

### 3.5 오행국(五行局) 결정
명궁의 **천간+지지** 조합에 따라 오행국이 결정된다. 이는 자미성 배치의 기준이 되는 중요한 수(水二·木三·金四·土五·火六).

엔진에는 60갑자 → 오행국 룩업 테이블을 상수로 보유.

### 3.6 자미성 배치
`紫微星`의 궁 위치는:

```
index = floor((birthDay - 1) / ju) + r
```

여기서 `ju`는 오행국 수(2~6), `r`은 잔여에 따른 보정치. 정확한 규칙은 다음 표를 사용한다.

| 오행국 | 자미성 위치 규칙 |
|---|---|
| 水二局 | (일수)/2 → 소수점 있으면 순행, 없으면 역행 |
| 木三局 | (일수)/3 → 동상 |
| 金四局 | /4 |
| 土五局 | /5 |
| 火六局 | /6 |

구현 상세: 엔진 내부에 **60일·5국 매트릭스**(정적 테이블)로 구현하여 분기 로직 제거. `src/tables/ziwei-position.ts`.

### 3.7 14주성 나머지 배치
자미성이 정해지면 천부성 계열을 포함한 14주성의 상대 위치가 결정론적으로 정해진다. 내부적으로:

1. 자미성 위치를 알면 `紫微星系(자미계열: 天機·太陽·武曲·天同·廉貞)` 5개의 위치가 규칙적으로 정해짐
2. 자미성과 **對宮 혹은 쌍** 관계로 `天府星系(천부계열: 太陰·貪狼·巨門·天相·天梁·七殺·破軍)` 7개 위치가 결정
3. 총 12개 + (紫微·天府 자체 2개) = 14주성

### 3.8 보좌성·살성·잡성
- **左輔·右弼:** 생월 기준
- **文昌·文曲:** 생시 기준 (시지)
- **天魁·天鉞:** 연간 기준
- **擎羊·陀羅:** 연간 기준 (祿存의 前後)
- **火星·鈴星:** 생년지 + 생시 조합 (유파에 따라 차이 — 우리는 남파 단일)
- **地空·地劫:** 생시 기준

각 배치 규칙은 `src/placers/*.ts`로 분리하고 단위 테스트 필수.

### 3.9 사화(四化)
연간(年干)에 따른 표준 사화표:

| 연간 | 祿 | 權 | 科 | 忌 |
|---|---|---|---|---|
| 甲 | 廉貞 | 破軍 | 武曲 | 太陽 |
| 乙 | 天機 | 天梁 | 紫微 | 太陰 |
| 丙 | 天同 | 天機 | 文昌 | 廉貞 |
| 丁 | 太陰 | 天同 | 天機 | 巨門 |
| 戊 | 貪狼 | 太陰 | 右弼 | 天機 |
| 己 | 武曲 | 貪狼 | 天梁 | 文曲 |
| 庚 | 太陽 | 武曲 | 太陰 | 天同 |
| 辛 | 巨門 | 太陽 | 文曲 | 文昌 |
| 壬 | 天梁 | 紫微 | 左輔 | 武曲 |
| 癸 | 破軍 | 巨門 | 太陰 | 貪狼 |

(주의: 유파에 따라 화과·화기의 배정이 다른 경우가 있음 — 남파 표준 채택)

### 3.10 대한(大限)
오행국 수가 시작 나이:
- 水二局 → 2세
- 木三局 → 3세
- … 火六局 → 6세

남/여 + 연간 음양 조합에 따라 **순행(시계방향)** 또는 **역행(시계반대)**. 10년 단위로 12궁을 한 바퀴.

---

## 4. 별 밝기(廟旺得利平閒陷)

각 주성은 각 궁지지에 따라 밝기가 달라진다. 정적 테이블(14 × 12 = 168 셀)로 `src/tables/brightness.ts`에 보유.

```typescript
type Brightness = "廟" | "旺" | "得" | "利" | "平" | "閒" | "陷";
```

해석 레이어는 밝기를 가중치로 사용(밝으면 긍정, 어두우면 부정 경향).

---

## 5. 트레이스(Trace)

```typescript
export interface ZiweiTrace {
  mingPalace: {
    rule: "寅-월지-시지";
    monthSteps: number;
    hourSteps: number;
    resultBranch: EarthlyBranch;
  };
  wuhuDun: {
    yearStem: HeavenlyStem;
    yinPalaceStem: HeavenlyStem;
  };
  fiveElementJu: {
    mingBranch: EarthlyBranch;
    mingStem: HeavenlyStem;
    resolvedJu: FiveElementJu;
  };
  ziweiPlacement: {
    ju: FiveElementJu;
    birthDay: number;
    computedIndex: number;
    tableRowUsed: string;  // 검증용 테이블 좌표
  };
  sihua: { yearStem: HeavenlyStem; resolved: {...}; };
  majorLimit: { direction: "cw" | "ccw"; startAge: number; };
}
```

UI의 [73-visual-language](./73-visual-language-v0.1.md) C8 Trace Viewer에서 그대로 사용 가능하도록 **평문화된 근거 문장**도 함께 제공:

```typescript
trace.humanReadable = [
  "명궁은 寅에서 출발, 월 3칸(→辰) 순행 후 시 3칸(→丑) 역행하여 丑입니다.",
  "연간 甲으로 寅궁은 丙寅이 되며, 명궁 丑은 己丑입니다.",
  "丙寅·己丑 조합으로 五行局은 土五局입니다.",
  "土五局·생일 12일 기준으로 자미성은 子궁에 안치됩니다.",
  ...
];
```

---

## 6. 결정론성·캐시

- 순수 함수. I/O 없음.
- 동일 입력 → 동일 출력 (1.0.0 고정).
- `schemaVersion` 변경 시 기존 `engine_results` 재계산 필요 (참조: [01-data-model §5.3](./01-data-model-v0.1.md)).

---

## 7. 테스트 전략

### 7.1 유닛
- 명궁 계산: 12 × 12 = 144 조합 전수 테스트
- 오호둔: 10 연간 × 12 궁지지 = 120 테스트
- 오행국: 60갑자 → 5국 룩업 전수
- 밝기표: 모든 주성 × 모든 궁지지 검증

### 7.2 골든 테스트
기존 신뢰할 수 있는 자미두수 도구(대만·홍콩 사이트) 10곳에서 동일 입력으로 명반을 뽑아 우리 결과와 대조. 50 케이스 이상.

**유파 차이로 불일치가 허용되는 항목**은 골든 테스트에서 명시적으로 제외(주석 필수).

### 7.3 속성 기반(fast-check)
- 임의 입력으로 돌려도 항상 12궁이 빠짐없이 채워짐
- 주성·보좌성·살성이 중복 없이 정확히 각 1회 배치됨 (주성 14개 모두 출현)
- 명궁과 신궁이 같은 축 위 (子午/丑未/…)

---

## 8. 문화적·법적 주의

- "자미두수"는 일반 명사로 상표 이슈 없음.
- 별 이름은 한자 그대로 사용하되 한글 독음 병기. 영문은 **로마자 고정 표기법**(예: 紫微 → Ziwei) 채택.
- 해석 문구는 **운명 단정 금지**, 확률·경향으로 기술(해석 레이어의 룰).

---

## 9. 오픈 이슈

1. 火星·鈴星 유파 선택 최종 확정 — 현재 남파. 사용자 피드백 수집 후 v2에 옵션화 검토.
2. 화과·화기의 丙年·戊年 변형 채택 여부 — 본 문서에서는 단일 표 사용.
3. 대한 시작 나이 계산에서 **만나이 vs 세는나이** — v1은 세는나이 기준(전통 관례). UI에 표기.

---

## 10. 변경 이력

| 날짜 | 버전 | 변경 | 담당 |
|---|---|---|---|
| 2026-04-20 | 0.1 | 최초 작성 | 솔로 |
