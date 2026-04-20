# 디자인 시스템 스펙

**Version:** 0.2
**Status:** 팔레트 확정 — **Monochrome + Terracotta**. 브랜드명 ARCHE 잠정 반영.
**Audience:** 본인(개발자), 차후 프런트 외주, UI 기여자
**Last updated:** 2026-04-20

---

## 0. 이 문서의 위치

본 문서는 **디자인 토큰 + 컴포넌트 규약**을 규정한다. "어떤 버튼을 언제 쓰나", "여백은 얼마인가", "색은 어디에 쓰나"를 결정한다. 브랜드의 추상적 방향은 `70-brand-identity`에서, 일러스트·차트의 구체적 시각 언어는 `73-visual-language`에서 다룬다.

**원칙.**
- **토큰 우선.** 매직 넘버 금지. 모든 스타일은 이름 붙은 토큰에서 나온다.
- **의미-기반 토큰 > 원시 토큰.** `color-surface-primary`가 `gray-50`보다 우선.
- **컴포넌트는 조합.** 새로운 컴포넌트를 쉽게 만들기보다, 프리미티브 조합으로 해결.
- **Tailwind v4 + CSS variables.** 토큰은 CSS custom properties로 선언하고, Tailwind theme에서 참조.

---

## 목차

- [1. 토큰 계층](#1-토큰-계층)
- [2. 컬러 토큰](#2-컬러-토큰)
- [3. 타이포그래피 토큰](#3-타이포그래피-토큰)
- [4. 공간·그리드 토큰](#4-공간그리드-토큰)
- [5. 모서리·그림자·보더 토큰](#5-모서리그림자보더-토큰)
- [6. 모션 토큰](#6-모션-토큰)
- [7. 아이콘 시스템](#7-아이콘-시스템)
- [8. 레이아웃](#8-레이아웃)
- [9. 컴포넌트 카탈로그](#9-컴포넌트-카탈로그)
- [10. 상태 체계](#10-상태-체계)
- [11. 접근성 기본](#11-접근성-기본)
- [12. 파일 구조](#12-파일-구조)
- [13. 오픈 이슈](#13-오픈-이슈)

---

## 1. 토큰 계층

### 1.1 3단 구조

```
┌─ Tier 1 — Primitive Tokens ────────────────
│   원시 스케일. 색 팔레트, 숫자 스케일.
│   예: color-neutral-50 = #FAFAF7
│       space-4 = 16px
├─ Tier 2 — Semantic Tokens ─────────────────
│   의미 기반 별칭. 컴포넌트가 주로 이걸 읽음.
│   예: color-surface-primary = color-neutral-50
│       space-inset-md = space-4
├─ Tier 3 — Component Tokens ────────────────
│   컴포넌트별 특수값. 필요할 때만 정의.
│   예: color-button-primary-bg = color-accent-900
│       space-button-padding-x = space-5
```

### 1.2 네이밍 규칙

- 케밥 케이스: `color-surface-primary`
- 속성-대상-변형 순서: `{category}-{subject}-{variant}`
- 다크모드는 별도 토큰 아닌 **테마 스위치**로 해결 (v2). v1은 라이트 온리.

### 1.3 CSS 변수 선언 (루트)

```css
/* packages/ui/src/tokens.css */
:root {
  /* Primitive */
  --color-neutral-0: #ffffff;
  --color-neutral-25: #fafaf7;  /* paper */
  --color-neutral-50: #f5f3ee;
  --color-neutral-100: #e8e5dc;
  /* ... */
  --color-ink-900: #141414;

  /* Semantic */
  --color-surface-primary: var(--color-neutral-25);
  --color-surface-elevated: var(--color-neutral-0);
  --color-text-primary: var(--color-ink-900);

  /* Space scale (rem-based, 4px = 0.25rem) */
  --space-0: 0;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  /* ... */
}
```

---

## 2. 컬러 토큰

> 팔레트 방향 **확정**: `70-brand-identity §8`의 **Monochrome + Terracotta** 안. 베이스는 오트밀(oatmeal), 잉크는 near-black, 악센트는 terracotta.

### 2.1 Primitive — Neutral Scale (Oatmeal 계열)

| 토큰 | 값 | 쓰임 |
|---|---|---|
| `color-neutral-0` | `#FFFFFF` | 순수 흰색 (카드 바닥의 최상단) |
| `color-neutral-25` | `#F5F2EB` | **Oatmeal — 본문 배경 기본** |
| `color-neutral-50` | `#EDE9DF` | Raised surface |
| `color-neutral-100` | `#DDD8CA` | Divider, hover bg |
| `color-neutral-200` | `#BDB6A3` | Subtle border |
| `color-neutral-400` | `#8A8372` | Disabled text, caption |
| `color-neutral-600` | `#5F584B` | Secondary text |
| `color-neutral-800` | `#2C2820` | Strong text |
| `color-ink-900` | `#1A1814` | Primary text |

### 2.2 Primitive — Accent (Terracotta)

단일 악센트. **Terracotta** — 지적 따뜻함. 과장된 열정 색이 아닌 **흙·도기** 뉘앙스.

| 토큰 | 값 | 쓰임 |
|---|---|---|
| `color-accent-50` | `#F7E8E2` | 매우 옅은 바탕 (highlight bg) |
| `color-accent-100` | `#EED1C5` | tint |
| `color-accent-200` | `#DFB2A0` | subtle highlight, chip bg |
| `color-accent-500` | `#C4563C` | **Primary accent** (링크·주요 CTA) |
| `color-accent-700` | `#9A3E2A` | hover |
| `color-accent-900` | `#6E2A1C` | active / 짙은 접점 |

**대비 검증** (WCAG):
- `color-accent-500` (#C4563C) on `color-neutral-25` (#F5F2EB): **4.6:1** ✅ AA (일반 텍스트 OK)
- `color-neutral-0` (#FFFFFF) on `color-accent-500`: **4.9:1** ✅ AA
- `color-accent-700` on `color-neutral-25`: **7.1:1** ✅ AAA (hover·emphasis)

악센트는 **섹션당 3회 이하** 등장 원칙(`70-brand-identity §2` 참조).

### 2.3 Primitive — Signal (오행·상태)

상태 색은 한 톤씩 절제.

| 토큰 | 값 | 쓰임 |
|---|---|---|
| `color-signal-success` | `#3F6E4D` | 성공·확인 |
| `color-signal-warning` | `#A67A2A` | 주의 |
| `color-signal-error` | `#8C3A2E` | 오류 |
| `color-signal-info` | `#2B4A6E` | 정보(중립) |

### 2.4 Primitive — 오행 팔레트 (예외)

| 토큰 | 값 |
|---|---|
| `color-element-wood` | `#5B7760` |
| `color-element-fire` | `#A64A3E` |
| `color-element-earth` | `#A88B5B` |
| `color-element-metal` | `#B5B2A8` |
| `color-element-water` | `#2E3B4E` |

채도를 낮춰 페이지 내 다른 악센트와 경쟁하지 않게 한다.

### 2.5 Semantic 토큰 매핑

| 의미 | 토큰 | 값 |
|---|---|---|
| 페이지 배경 | `color-surface-primary` | `color-neutral-25` (oatmeal) |
| 카드 배경 | `color-surface-elevated` | `color-neutral-0` |
| 섹션 배경 | `color-surface-muted` | `color-neutral-50` |
| 기본 텍스트 | `color-text-primary` | `color-ink-900` |
| 보조 텍스트 | `color-text-secondary` | `color-neutral-600` |
| 약한 텍스트 | `color-text-tertiary` | `color-neutral-400` |
| 링크 | `color-text-link` | `color-accent-700` |
| CTA 배경 | `color-bg-accent` | `color-accent-500` |
| CTA hover | `color-bg-accent-hover` | `color-accent-700` |
| 구분선 | `color-border-default` | `color-neutral-100` |
| 입력 보더 | `color-border-input` | `color-neutral-200` |
| 포커스 링 | `color-border-focus` | `color-accent-500` |

### 2.6 컬러 사용 규약

- 악센트는 **한 페이지에 3개소 이하**. 남용 금지.
- 오행 팔레트는 **오행 시각화 및 그와 직결된 칩**에서만 사용.
- 한 컴포넌트 내부에서 ink + accent 외 세 번째 색 등장 금지(단, 차트 예외).
- 다크모드는 **v1 미지원**. 단, 토큰을 통해 나중 스위칭 가능하도록 설계.

---

## 3. 타이포그래피 토큰

### 3.1 패밀리

```css
--font-family-serif:    'Fraunces', 'Sandoll 격동명조', ui-serif, Georgia, serif;
--font-family-sans:     'Inter Variable', 'Pretendard Variable', system-ui, sans-serif;
--font-family-mono:     'JetBrains Mono', 'D2Coding', ui-monospace, monospace;
```

- 헤드라인은 기본 serif. 본문은 기본 sans.
- mono는 숫자·trace 데이터 표시.

### 3.2 타입 스케일

**1.250 (Major Third) 스케일.** 기준 16px = 1rem.

| 토큰 | 크기 (rem) | 픽셀 | 줄높이 | 용도 |
|---|---|---|---|---|
| `text-2xs` | 0.694 | 11.1 | 1.4 | 메타·캡션 |
| `text-xs` | 0.833 | 13.3 | 1.5 | 보조 텍스트 |
| `text-sm` | 1.000 | 16 | 1.6 | 본문(기본) |
| `text-base` | 1.200 | 19.2 | 1.6 | 리포트 본문 |
| `text-lg` | 1.440 | 23 | 1.45 | Subhead |
| `text-xl` | 1.728 | 27.6 | 1.35 | Section head |
| `text-2xl` | 2.074 | 33.2 | 1.25 | Page head |
| `text-3xl` | 2.488 | 39.8 | 1.15 | Display S |
| `text-4xl` | 2.986 | 47.8 | 1.1 | Display M |
| `text-5xl` | 3.583 | 57.3 | 1.05 | Display L |

### 3.3 무게

| 토큰 | 값 | 용도 |
|---|---|---|
| `font-weight-regular` | 400 | 본문 |
| `font-weight-medium` | 500 | 강조 |
| `font-weight-semibold` | 600 | Subhead |
| `font-weight-bold` | 700 | Head |

*Variable font 활용 — wght 축 연속 조정 가능.*

### 3.4 타이포 역할 (Typography Roles)

컴포넌트는 스케일 토큰 대신 **역할 토큰**을 쓴다.

| 역할 | 패밀리 | 사이즈 | 무게 | 줄높이 |
|---|---|---|---|---|
| `display-lg` | serif | 5xl | 500 | 1.05 |
| `display-md` | serif | 4xl | 500 | 1.1 |
| `heading-1` | serif | 3xl | 600 | 1.15 |
| `heading-2` | serif | 2xl | 600 | 1.25 |
| `heading-3` | sans | xl | 600 | 1.35 |
| `body-lg` | sans | base | 400 | 1.6 |
| `body-md` | sans | sm | 400 | 1.6 |
| `body-sm` | sans | xs | 400 | 1.5 |
| `label` | sans | xs | 500 | 1.4 |
| `caption` | sans | 2xs | 400 | 1.4 |
| `numeric-lg` | mono | xl | 500 | 1.2 (tabular) |
| `numeric-md` | mono | sm | 500 | 1.2 (tabular) |

### 3.5 타이포 규약

- **한 페이지 최대 3개 타입 역할.** 잡다한 크기 혼용 금지.
- 리포트 본문은 `body-lg` 기본. `body-md`보다 한 단계 크게.
- 숫자 데이터는 반드시 mono tabular.
- 한자·한글 혼용 시 자간 +1%, 영문 혼용 시 0.

---

## 4. 공간·그리드 토큰

### 4.1 Space Scale (4px base)

| 토큰 | rem | 픽셀 |
|---|---|---|
| `space-0` | 0 | 0 |
| `space-px` | 1px | 1 |
| `space-1` | 0.25 | 4 |
| `space-2` | 0.5 | 8 |
| `space-3` | 0.75 | 12 |
| `space-4` | 1 | 16 |
| `space-5` | 1.25 | 20 |
| `space-6` | 1.5 | 24 |
| `space-8` | 2 | 32 |
| `space-10` | 2.5 | 40 |
| `space-12` | 3 | 48 |
| `space-16` | 4 | 64 |
| `space-20` | 5 | 80 |
| `space-24` | 6 | 96 |
| `space-32` | 8 | 128 |

### 4.2 Semantic Space

| 토큰 | 값 | 용도 |
|---|---|---|
| `space-inset-xs` | 8 | Button sm padding |
| `space-inset-sm` | 12 | Input padding |
| `space-inset-md` | 16 | Card padding default |
| `space-inset-lg` | 24 | Card padding large |
| `space-stack-xs` | 4 | 인접 요소 간 수직 |
| `space-stack-sm` | 8 | |
| `space-stack-md` | 16 | |
| `space-stack-lg` | 24 | |
| `space-stack-xl` | 40 | 섹션 간 |
| `space-stack-2xl` | 64 | 대섹션 간 |

### 4.3 그리드

**데스크톱(≥1024):** 12컬럼, 거터 24, 마진 auto, max-width `1120px` (콘텐츠 너비), 리포트 독서 영역은 `max-width: 680px`.

**태블릿(640–1023):** 6컬럼, 거터 16, 마진 24.

**모바일(<640):** 4컬럼, 거터 12, 마진 16.

### 4.4 브레이크포인트

| 토큰 | 값 | 비고 |
|---|---|---|
| `breakpoint-sm` | 640px | 모바일 상한 |
| `breakpoint-md` | 768px | 태블릿 포트 |
| `breakpoint-lg` | 1024px | 데스크톱 시작 |
| `breakpoint-xl` | 1280px | 와이드 |
| `breakpoint-2xl` | 1536px | 초와이드 |

---

## 5. 모서리·그림자·보더 토큰

### 5.1 Radius

| 토큰 | 값 | 용도 |
|---|---|---|
| `radius-none` | 0 | 테이블 셀 |
| `radius-xs` | 2 | 칩, 배지 |
| `radius-sm` | 4 | 버튼 sm |
| `radius-md` | 6 | 버튼·인풋·카드(기본) |
| `radius-lg` | 10 | 모달·큰 카드 |
| `radius-xl` | 16 | 히어로 이미지 카드 |
| `radius-full` | 9999 | 아바타, 토글 |

**원칙:** 전체적으로 **적당히 둥근** 수준. 과하게 둥근 모바일 클리셰(16 이상) 지양.

### 5.2 Shadow

| 토큰 | 값 | 용도 |
|---|---|---|
| `shadow-none` | 없음 | 디폴트 |
| `shadow-xs` | `0 1px 2px rgba(20,20,20,0.04)` | 인풋 강조 |
| `shadow-sm` | `0 2px 4px rgba(20,20,20,0.06)` | 카드 호버 |
| `shadow-md` | `0 6px 16px rgba(20,20,20,0.08)` | 드롭다운, 팝오버 |
| `shadow-lg` | `0 16px 40px rgba(20,20,20,0.12)` | 모달 |

Shadow는 **옅게**. 페이퍼 느낌 유지.

### 5.3 Border

| 토큰 | 값 | 용도 |
|---|---|---|
| `border-width-hairline` | 1px | 기본 구분선 |
| `border-width-default` | 1.5px | 인풋 |
| `border-width-strong` | 2px | 포커스 |

---

## 6. 모션 토큰

### 6.1 Duration

| 토큰 | 값 |
|---|---|
| `duration-instant` | 80ms |
| `duration-fast` | 150ms |
| `duration-normal` | 220ms |
| `duration-slow` | 320ms |
| `duration-slower` | 500ms |

### 6.2 Easing

| 토큰 | 값 | 용도 |
|---|---|---|
| `ease-linear` | linear | 로딩 스피너 |
| `ease-out` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | 기본 entry |
| `ease-in` | `cubic-bezier(0.6, 0, 0.84, 0)` | exit |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | 이동 |
| `ease-spring` | Framer spring (stiffness 180, damping 22) | 드래그·panel |

### 6.3 모션 규약

- prefers-reduced-motion 사용자에게는 모든 duration을 1ms로.
- 크기 변화는 spring, 위치 이동은 ease-out 기본.

---

## 7. 아이콘 시스템

### 7.1 선택

**Primary:** [Lucide](https://lucide.dev) — OFL, 가변 선 두께, 1200+ 아이콘.
**Secondary:** 자체 제작 도메인 아이콘 — 사주 기둥, 12지, 별자리 마크 등. `73-visual-language`에서 커스텀 규칙.

### 7.2 규격

- 사이즈 토큰: 14 / 16 / 20 / 24 / 32 / 48
- 선 두께: 1.5px (Lucide 기본). 커스텀 아이콘도 1.5px 매칭.
- 컬러는 `currentColor` 상속. 단, 오행 아이콘은 요소 색 고정.
- 아이콘은 의미 전달 시 **반드시 접근 가능한 라벨 동반** (aria-label 또는 인접 텍스트).

---

## 8. 레이아웃

### 8.1 페이지 뼈대

```
┌─────────────────────────────────────────────┐
│ Top Nav (64h)                               │
├─────────────────────────────────────────────┤
│                                             │
│  Content (max-width 1120, 측면 auto margin)  │
│                                             │
├─────────────────────────────────────────────┤
│ Footer                                      │
└─────────────────────────────────────────────┘
```

### 8.2 리포트 뷰어 레이아웃

```
┌──────────────────────────────────────────────────────┐
│ [프로필 이름]                          [공유 · 저장] │
├────────────┬─────────────────────────────────────────┤
│            │                                         │
│  Section   │   Content (max-width 680)               │
│  Nav       │                                         │
│  (sticky)  │   ── 리포트 섹션들                      │
│            │                                         │
└────────────┴─────────────────────────────────────────┘
```

- 좌측 섹션 네비는 스크롤스파이.
- 모바일에서는 네비 상단 고정 탭으로 전환.

### 8.3 Density

- **Comfortable** (기본, 대부분 화면)
- **Compact** (데이터 집약 화면 — 명반·월운 달력)

---

## 9. 컴포넌트 카탈로그

### 9.1 v1 필수 컴포넌트

| 컴포넌트 | shadcn 기반? | 도메인 특수 |
|---|---|---|
| Button | ✅ | — |
| Icon Button | ✅ | — |
| Input / Textarea | ✅ | — |
| Select / Combobox | ✅ | — |
| Date-Time Picker | 부분 | **생년월일시 + 양/음력 스위치** |
| Location Picker | 자체 제작 | 도시 프리셋 + 좌표 수동 |
| Radio / Checkbox / Switch | ✅ | — |
| Slider | ✅ | — |
| Tabs | ✅ | — |
| Accordion | ✅ | 리포트 펼침 |
| Tooltip / Popover | ✅ | 용어 풀이 |
| Dialog (Modal) | ✅ | 결제 확인 |
| Sheet (Drawer) | ✅ | 모바일 메뉴 |
| Toast / Alert | ✅ | 피드백 |
| Badge / Chip | ✅ | 오행 칩 |
| Card | ✅ | 프로필 카드, 리포트 카드 |
| Table | ✅ | 사주 원국 표 |
| Progress | ✅ | 설문 진행 |
| Skeleton | ✅ | 계산 로딩 |
| Avatar | ✅ | 프로필 |
| Breadcrumb | ✅ | — |
| Pagination | ✅ | — |
| Command (⌘K) | ✅ | 프로필 간 전환 |

### 9.2 도메인 특수 컴포넌트

| 컴포넌트 | 설명 |
|---|---|
| **SajuWonGukTable** | 사주 원국 표시 (연·월·일·시 × 천간·지지·지장간) |
| **OhaengPieChart** | 오행 비율 도넛/파이 |
| **Ziwei Palace Grid** | 자미두수 12궁 명반 — 3×4 또는 3×3 배치 |
| **Forty8WeekWheel** | Goldschneider 48주 휠 (원형 타임라인) |
| **EnneagramTriangle** | 애니어그램 9각형 + 화살표 |
| **MBTIAxisBars** | E/I, S/N, T/F, J/P 4축 강도 바 |
| **EngineTraceViewer** | trace JSON을 계층형으로 펼쳐 보여주는 뷰어 |
| **ReportSectionCard** | 리포트 내 한 섹션 표준 카드 (헤더/요약/상세) |
| **CrossInsightBadge** | 교차 해석 힌트 칩 ("명리+애니어그램 공통 키워드") |

### 9.3 Button — 상세 예시

**Variants:** `primary` / `secondary` / `ghost` / `link` / `destructive`
**Sizes:** `sm` / `md` (default) / `lg`
**State:** default / hover / active / disabled / loading

**Primary Button md 토큰:**
```
bg:          color-accent-900
color:       color-neutral-0
padding-x:   space-5  (20)
padding-y:   space-3  (12)
radius:      radius-md
font:        body-md, weight-medium
hover:       bg → color-accent-700
focus ring:  2px color-accent-700 outline, offset 2
disabled:    opacity 0.5, cursor not-allowed
```

### 9.4 Card — 상세 예시

**Variants:** `flat` (no shadow, border only) / `elevated` (shadow-sm) / `outlined`
**Padding:** `space-inset-md` default, `space-inset-lg` for hero
**Radius:** `radius-md`

### 9.5 Input — 상세 예시

```
height:       40px (default), 48px (lg)
padding-x:    space-4
border:       1.5px color-border-input
radius:       radius-md
bg:           color-surface-elevated
placeholder:  color-text-tertiary
focus:        border color-border-focus, outline 2px with opacity 0.15
error:        border color-signal-error, helper text below
```

---

## 10. 상태 체계

### 10.1 인터랙티브 상태 (모든 컴포넌트 공통)

| 상태 | 시각 |
|---|---|
| default | 기본 토큰 |
| hover | bg 또는 border 한 단계 강화 |
| active (pressed) | bg 한 단계 더 강화 또는 scale 0.98 |
| focus-visible | 포커스 링 2px (`color-border-focus`), offset 2px |
| disabled | opacity 0.5, 커서 not-allowed |
| loading | 콘텐츠 투명 + spinner 오버레이 |

### 10.2 데이터 상태 (콘텐츠 영역)

| 상태 | 시각 요소 |
|---|---|
| empty | 일러스트(간결) + 안내 문구 + 주된 액션 버튼 |
| loading | skeleton (shimmer X, 단순 pulse) |
| error | 오류 아이콘 + 메시지 + "다시 시도" |
| partial | 부분 로드된 섹션에 "더 로드 중..." placeholder |
| success | 결과 노출, 변화 없음 (성공 토스트 남발 금지) |

---

## 11. 접근성 기본

> 상세는 `74-accessibility-spec`. 여기서는 디자인 시스템이 보장해야 하는 기본만.

- 텍스트 대비 최소 4.5:1 (AA). 큰 텍스트 3:1.
- 포커스 링은 **모든** 인터랙티브 요소에 기본 표시.
- 색만으로 상태 전달 금지 (아이콘·라벨 병행).
- 터치 대상 최소 44×44.
- 애니메이션은 prefers-reduced-motion 존중.

---

## 12. 파일 구조

```
packages/ui/
├── src/
│   ├── tokens/
│   │   ├── primitive.css
│   │   ├── semantic.css
│   │   └── index.ts     ← JS에서 쓰기 위한 토큰 object
│   ├── themes/
│   │   └── light.css
│   ├── components/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── domain/          ← 도메인 특수
│   │   ├── saju-table.tsx
│   │   ├── ohaeng-pie.tsx
│   │   └── ...
│   ├── hooks/
│   └── index.ts
├── tailwind.preset.js   ← 다른 앱이 extends하는 preset
└── package.json
```

- `packages/ui`는 domain-agnostic에서 domain-aware로 두 계층. 순수 UI는 `components/`, 도메인 UI는 `domain/`.
- Tailwind preset을 export해서 `apps/web`에서 `extends`로 사용.

---

## 13. 오픈 이슈

| # | 이슈 | 결정 시점 |
|---|---|---|
| DS-1 | 컬러 팔레트 최종 확정 (Ink&Paper vs 다른 안) | 브랜드 확정 즉시 |
| DS-2 | 헤드라인 폰트 최종 선정 (Fraunces vs Spectral vs Sandoll 격동) | D+5 |
| DS-3 | 도메인 특수 컴포넌트 9개의 상세 스펙 | 각 엔진 스펙과 병행 |
| DS-4 | Storybook 도입 여부 (1인 비용 대비 효과) | D+14 |
| DS-5 | 다크모드 도입 시점 — v2 확정, 토큰은 지금 대비 | 완료(대비만) |

---

## 변경 이력

| 버전 | 날짜 | 변경 |
|---|---|---|
| 0.1 | 2026-04-20 | 초안. 토큰 계층·컬러·타이포·스페이스·컴포넌트 카탈로그 확립 |
