# 본연 (BONYEON)

> 다섯 체계로 비추는 본연(本然). 사주·자미두수·48주·성향·내면 동기 통합 분석 플랫폼.

**상태:** P0 스펙 완료 · 모노레포 스캐폴딩 초안 · 코어 구현 대기
**최종 갱신:** 2026-04-20

---

## 구조

```
bonyeon/
├── apps/
│   └── web/                         Next.js 15 웹 앱 (App Router)
├── packages/
│   ├── shared/                      공통 타입·유틸·스키마
│   ├── engine-manseryeok/           사주 엔진 (P1 W2)
│   ├── engine-ziweidoushu/          자미두수 엔진 (P2 W3)
│   ├── engine-goldschneider/        48주 원형 엔진 (P2 W4)
│   ├── engine-mbti/                 4축 성향 엔진 (P2 W4)
│   ├── engine-enneagram/            9유형 엔진 (P2 W5)
│   └── interpretation/              해석 레이어 (P2 W6)
└── docs/                            스펙 문서 (18개)
```

---

## 시작하기

**전제:** Node.js 22+, pnpm 9+.

```bash
# 의존성 설치 (최초 1회)
pnpm install

# 개발 서버
pnpm dev

# 타입체크
pnpm typecheck

# 테스트
pnpm test

# 빌드
pnpm build
```

---

## 문서 지도

핵심 문서는 [`docs/`](docs/)에 있다. 번호는 읽는 순서이기도 하다.

### 플랫폼·데이터
- [00-architecture-overview](docs/00-architecture-overview-v0.1.md) — 전체 아키텍처 개괄
- [01-data-model](docs/01-data-model-v0.1.md) — DB 스키마·엔티티

### 엔진 스펙
- [10-engine-manseryeok](docs/10-engine-manseryeok-spec-v0.1.md) — 만세력
- [11-engine-ziweidoushu](docs/11-engine-ziweidoushu-spec-v0.1.md) — 자미두수
- [12-engine-goldschneider](docs/12-engine-goldschneider-spec-v0.1.md) — 48주 원형
- [13-engine-mbti](docs/13-engine-mbti-spec-v0.1.md) — 4축 성향 (자체 문항)
- [14-engine-enneagram](docs/14-engine-enneagram-spec-v0.1.md) — 에니어그램 (자체 문항)

### 해석·프런트·백엔드
- [20-interpretation-layer](docs/20-interpretation-layer-spec-v0.1.md) — 템플릿+LLM
- [30-web-frontend](docs/30-web-frontend-spec-v0.1.md) — Next.js 15 구조
- [40-backend-api](docs/40-backend-api-spec-v0.1.md) — tRPC·Auth
- [50-payments-subscription](docs/50-payments-subscription-spec-v0.1.md) — 토스·Stripe
- [60-privacy-compliance](docs/60-privacy-compliance-spec-v0.1.md) — PIPA 대응
- [90-observability](docs/90-observability-spec-v0.1.md) — Sentry·PostHog

### 브랜드·디자인
- [70-brand-identity](docs/70-brand-identity-v0.1.md) — **본연** 네이밍·톤
- [71-design-system](docs/71-design-system-v0.1.md) — 토큰·컴포넌트
- [72-ux-flows](docs/72-ux-flows-v0.1.md) — F1~F9 플로우
- [73-visual-language](docs/73-visual-language-v0.1.md) — 9종 차트 스펙
- [74-accessibility](docs/74-accessibility-v0.1.md) — WCAG/KWCAG

### 네이밍 워크시트
- [80-brand-naming-research](docs/80-brand-naming-research-v0.1.md) — ARCHE 기각 근거
- [81-goldschneider-archetype-names](docs/81-goldschneider-archetype-names-v0.1.md) — 48주
- [82-mbti-type-names](docs/82-mbti-type-names-v0.1.md) — 16유형
- [83-enneagram-type-names](docs/83-enneagram-type-names-v0.1.md) — 9유형

### 마일스톤
- [99-mvp-milestones](docs/99-mvp-milestones-v0.1.md) — B안 주단위 일정

---

## 원칙

1. **스펙 우선.** 구현보다 문서가 항상 앞선다.
2. **결정론성.** 엔진은 순수 함수. 같은 입력 → 같은 출력.
3. **투명성.** 모든 해석에는 근거(trace)가 함께 간다.
4. **운명 단정 금지.** "~될 것이다" ✗ / "~하는 경향" ✅
5. **동·서 카테고리 분리.** 사주/자미두수와 MBTI/Enneagram을 섞지 않는다. 교차 인사이트 섹션에서만 연결.

---

## 라이선스 & 저작권

- MBTI·Enneagram·Goldschneider 등의 **상업 검사지·원서 문장은 차용하지 않는다**. 모든 문항·유형명·원형명은 **자체 저술**.
- 상세는 [60-privacy-compliance](docs/60-privacy-compliance-spec-v0.1.md) · 각 엔진 스펙의 §0 섹션 참조.
