---
doc: 30-web-frontend-spec
version: 0.1
status: draft
owner: 1인 풀스택
depends_on:
  - 00-architecture-overview-v0.1
  - 01-data-model-v0.1
  - 71-design-system-v0.1
  - 72-ux-flows-v0.1
  - 73-visual-language-v0.1
  - 74-accessibility-v0.1
scope: Next.js 15 웹 프런트엔드 구조·라우팅·상태·번들
---

# 30. 웹 프런트엔드 스펙

> Next.js 15 (App Router) + React 19 + Tailwind v4 + shadcn/ui 기반. 모바일 우선 반응형. Server Components 기본, Client Components는 **상호작용이 필요한 경우에만**.

---

## 1. 기술 스택

| 영역 | 선택 | 버전 |
|---|---|---|
| 프레임워크 | Next.js | 15.x (App Router) |
| React | React | 19 |
| 스타일 | Tailwind CSS | v4 (CSS-first) |
| UI 컴포넌트 | shadcn/ui | Latest |
| 상태 (클라) | Zustand | ^4 |
| 데이터 페칭 | TanStack Query + tRPC | @tanstack/react-query ^5, tRPC ^11 |
| 폼 | React Hook Form + Zod | 최신 |
| 모션 | Framer Motion | ^11 |
| 차트 | Visx + D3(scales only) | 최신 |
| 아이콘 | Lucide + 커스텀 SVG | |
| 폰트 | Pretendard Variable, Lora | self-hosted |
| 패키지 매니저 | pnpm + Turborepo | |
| 테스트 | Vitest + Playwright | |

---

## 2. 디렉토리 구조

```
apps/web/
├── src/
│   ├── app/                      # App Router
│   │   ├── (marketing)/          # 랜딩·소개·가격 (정적)
│   │   │   ├── page.tsx          # "/"
│   │   │   ├── pricing/page.tsx
│   │   │   └── legal/
│   │   ├── (auth)/               # 로그인·가입
│   │   │   ├── sign-in/page.tsx
│   │   │   └── sign-up/page.tsx
│   │   ├── (app)/                # 인증 필요
│   │   │   ├── new/              # F2 프로필 생성 플로우
│   │   │   │   └── page.tsx
│   │   │   ├── profiles/
│   │   │   │   ├── page.tsx      # F8 프로필 목록
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx  # F4 리포트 뷰어
│   │   │   │       ├── survey/   # F3 설문
│   │   │   │       └── share/    # F7 공유 설정
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   └── subscription/page.tsx  # F9
│   │   │   └── billing/
│   │   │       └── checkout/[sku]/page.tsx  # F5
│   │   ├── share/[token]/page.tsx  # 공개 공유 링크 (인증 불필요)
│   │   ├── api/                  # 최소: 웹훅·OG 이미지
│   │   │   ├── trpc/[trpc]/route.ts
│   │   │   ├── og/route.tsx      # Satori OG 생성
│   │   │   └── webhooks/
│   │   │       ├── toss/route.ts
│   │   │       └── stripe/route.ts
│   │   ├── layout.tsx            # 루트 레이아웃
│   │   └── globals.css           # Tailwind v4 토큰
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn 설치물
│   │   ├── domain/               # 9종 도메인 차트·카드
│   │   │   ├── SajuWonGukTable.tsx
│   │   │   ├── OhaengPieChart.tsx
│   │   │   ├── ZiweiPalaceGrid.tsx
│   │   │   ├── Forty8WeekWheel.tsx
│   │   │   ├── EnneagramTriangle.tsx
│   │   │   ├── MBTIAxisBars.tsx
│   │   │   ├── EngineTraceViewer.tsx
│   │   │   ├── ReportSectionCard.tsx
│   │   │   └── CrossInsightBadge.tsx
│   │   ├── layout/               # Header, Footer, SideNav
│   │   └── feedback/             # Toast, EmptyState, ErrorBoundary
│   │
│   ├── lib/
│   │   ├── trpc/                 # tRPC 클라이언트
│   │   ├── auth/                 # Auth.js helpers
│   │   ├── stores/               # Zustand stores
│   │   ├── utils/
│   │   └── analytics/            # PostHog wrapper
│   │
│   ├── styles/
│   │   └── tokens.css            # 71-design-system 토큰
│   │
│   └── env.ts                    # t3-env (환경변수 타입)
│
├── public/
├── drizzle/                      # 마이그레이션 (백엔드 공용)
├── tests/
│   ├── e2e/                      # Playwright
│   └── setup/                    # Vitest 설정
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 3. 라우팅·인증 게이트

### 3.1 라우트 그룹
- `(marketing)`: 공개. 정적 생성(SSG)·ISR.
- `(auth)`: 미인증 상태만 접근. 인증 상태면 `/profiles`로 리다이렉트.
- `(app)`: 인증 필수. `middleware.ts`에서 세션 검증 → 미인증이면 `/sign-in?next=…`.
- `share/[token]`: 공개. 서버 컴포넌트에서 공유 정책(`scope`, `expires_at`, `revoked_at`) 검증.

### 3.2 Entitlement 체크
- 유료 섹션 접근 시 서버 컴포넌트에서 `hasEntitlement(userId, reportId, feature)` 호출
- 미보유 → `<PaywallCard sku=...>` 표시 (페이지 내 인라인, 리다이렉트 ❌)

---

## 4. Server Components vs Client Components

### 4.1 기본 원칙
- **기본은 Server Component**. 데이터 fetch를 서버에서 끝내고 HTML 스트리밍.
- Client Component는 다음 경우에만:
  - 이벤트 핸들러 필요 (`onClick`, `onChange`, 폼)
  - 브라우저 API 사용 (localStorage, IntersectionObserver)
  - 서드파티 훅 의존 (tRPC subscription 등)
  - 클라 상태·모션

### 4.2 차트 컴포넌트
- 정적 차트(사주 원국 표, 자미두수 명반) → Server Component + SVG 직접 렌더
- 상호작용 차트(Hover tooltip, Trace Viewer 전개) → Client Component
- 번들 축소: 상호작용 필요 없는 차트는 SSR SVG로 충분

---

## 5. 데이터 플로우

### 5.1 tRPC
- 서버: `apps/web/src/server/routers/*.ts`
- 클라: `createTRPCReact` + `@tanstack/react-query`
- 서버 컴포넌트에서는 `createCaller()`로 직접 호출 (HTTP 왕복 없음)

```typescript
// 서버 컴포넌트에서:
const report = await trpcCaller.report.getById({ id });

// 클라이언트 컴포넌트에서:
const { data: report } = trpc.report.getById.useQuery({ id });
```

### 5.2 Cache 정책
- 엔진 결과: SWR stale=1h, revalidate on focus=false
- 리포트 잠긴 것(`locked_at !== null`): stale=Infinity
- 세션·entitlement: `no-store` 강제

### 5.3 Optimistic UI
- 프로필 편집, 리포트 제목 편집 등 읽기-쓰기 비대칭 액션에만 한정 적용
- 결제·구독 관련은 Optimistic 금지 (서버 응답 기다림)

---

## 6. 상태 관리

### 6.1 Zustand stores
- `useSurveyStore`: 설문 진행 상태(현재 문항, 응답, 진행률). 세션 로컬 영속(localStorage).
- `useReportViewStore`: 현재 보고 있는 섹션, Trace 패널 열림 여부.
- `useThemeStore`: v2에서 dark/light. v1은 light only로 stub.

### 6.2 URL 상태
- 리포트 뷰어의 현재 섹션은 `#manseryeok`·`#ziweidoushu` 등 **해시**로.
- 설문 문항 번호는 `?q=34`.
- 공유 가능한 상태는 URL에, 아니면 Zustand.

---

## 7. 번들·성능 정책

### 7.1 예산
- 초기 HTML: < 50KB (gzip)
- 초기 JS: < 120KB (gzip)
- LCP < 2.5s (Vercel Edge 서울 기준)
- CLS < 0.05
- INP < 200ms

### 7.2 코드 분할
- 차트 라이브러리(Visx, D3) → 리포트 뷰어 라우트에서만 로드
- Framer Motion → 인터랙티브 섹션에서만
- Lucide 아이콘 → tree-shakable import만 사용 (`import { Icon } from "lucide-react"`)

### 7.3 이미지
- `next/image` 필수
- 아이콘은 SVG 인라인 (번들 합산) + sprite 금지 (접근성 문제)
- OG 이미지는 `@vercel/og` + Satori로 엣지에서 동적 생성, 결과 `s-maxage=604800, immutable` 캐시

### 7.4 폰트
- self-hosted Pretendard Variable (KR) + Lora (EN, 한정 사용)
- `next/font/local` 사용, `display: swap`
- FOUT 방지: 주요 랜딩 텍스트는 `font-synthesis: none`

---

## 8. 스타일

### 8.1 Tailwind v4
- `@theme` 블록에 [71-design-system](./71-design-system-v0.1.md) 토큰 주입
- 커스텀 플러그인 최소화
- `clsx` + `tailwind-merge` = `cn` helper 사용

### 8.2 다크모드
- v1은 미지원. 토큰에는 `@media (prefers-color-scheme: dark)` 자리만 예약 (빈 블록)
- 시스템 다크 선호 사용자도 항상 라이트 모드 표시 (의도된 결정)

### 8.3 애니메이션
- [73-visual-language §모션 원칙](./73-visual-language-v0.1.md) 준수
- `prefers-reduced-motion` 시 모든 Framer Motion `animate` → 즉시 상태

---

## 9. 폼·검증

- React Hook Form + Zod (`@hookform/resolvers/zod`)
- 생년월일: `react-day-picker` + 시간 입력은 시/분 select
- 에러 메시지는 **인라인 + aria-describedby** ([74-accessibility](./74-accessibility-v0.1.md))
- 설문 저장: 문항 이동 시마다 서버에 patch (connection 끊김 대비)

---

## 10. 에러 처리

### 10.1 ErrorBoundary
- 라우트별 `error.tsx` 제공
- 최상위 `global-error.tsx`
- 도메인 오류(엔진 계산 실패 등): `EngineError` 타입으로 분류, 사용자 친화 메시지 + Sentry 연계

### 10.2 404·403
- `not-found.tsx`로 처리
- 권한 부족은 403 + Paywall 카드 + `next`쿼리로 원 경로 보존

---

## 11. 접근성

- [74-accessibility](./74-accessibility-v0.1.md) 체크리스트 전체 준수
- axe-core CI 통합 (Playwright + `@axe-core/playwright`)
- 주요 플로우 키보드 전용 스크립트 매뉴얼 QA 월 1회

---

## 12. 국제화

- v1: **ko-KR only**. `next-intl` 셋업만 해두고 기본 locale 고정.
- 문자열은 `messages/ko.json`에 집약. 코드 하드코딩 최소화.
- 한자: 본문 렌더 시 `<ruby>` 태그로 한글 독음 병기 (옵션, 설정으로 on/off).

---

## 13. 테스트

### 13.1 단위
- 컴포넌트: Vitest + Testing Library
- 커스텀 훅: Vitest + renderHook

### 13.2 E2E (Playwright)
- 필수 플로우 10종 (F1~F9 + 공유 링크 열람)
- Chromium + WebKit + Firefox
- 모바일 뷰포트(375px) 포함
- axe 감사 자동화

### 13.3 시각 회귀
- Playwright 스크린샷 스냅샷 (메인 화면 5개) — 디자인 토큰 변경 시 갱신

---

## 14. 오픈 이슈

1. **Partial Pre-rendering (PPR)** 채택 여부 — Next.js 15에서 안정 여부 확인. 불안정 시 기본 SSR.
2. **폰트 용량** — Pretendard Variable 약 2MB. 서브셋팅 필수. 빌드 타임 pyftsubset.
3. **Server Actions vs tRPC** — v1은 tRPC 단일. Server Actions는 단순 변형에 혼용 가능하나 일관성 위해 보류.

---

## 15. 변경 이력

| 날짜 | 버전 | 변경 | 담당 |
|---|---|---|---|
| 2026-04-20 | 0.1 | 최초 작성 | 솔로 |
