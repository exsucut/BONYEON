---
doc: 99-mvp-milestones
version: 0.1
status: draft
owner: 1인 풀스택 (솔로)
confirmed: 2026-04-20
scope: MVP B안 — 5엔진 풀스펙 / 베타 6월 / 정식 7월
---

# 99. MVP 마일스톤 (B안)

> 확정된 B안을 주(week) 단위로 쪼갠 실행 계획입니다. 1인 풀타임 기준이며, **엔진 수는 절대 축소하지 않되** 지연 발생 시 "해석 문단 깊이"로만 조정합니다.

---

## 0. 전제와 제약

### 0.1 리소스
- **인력:** 1명 (풀타임, 기획·디자인·프런트·백엔드·데브옵스 전부)
- **가용 시간:** 주 45~55시간 가정 (버퍼 10%)
- **외주 예산:** 로고·일러스트 최소 범위에 한해 검토 (필수 아님)

### 0.2 Non-goal (v1 절대 제외)
- 인력 상담·전문가 매칭
- 소개팅·매칭
- 주술성 굿즈·부적
- 다국어 (ko-KR only)
- 네이티브 앱 (웹 먼저, 앱은 v2)
- 다크모드 (v2)

### 0.3 품질 게이트 (모든 마일스톤에 공통 적용)
- TypeScript strict 모드 통과
- Vitest 커버리지 엔진 코어 ≥ 90%
- Playwright E2E 메인 플로우 통과
- Lighthouse 90+ (Performance/Accessibility/Best Practices/SEO)
- axe-core CI에서 Serious/Critical 0건
- Sentry 릴리스 마킹

---

## 1. 타임라인 오버뷰

| 기간 | 페이즈 | 산출물 |
|---|---|---|
| 2026-04-20 ~ 05-03 | P0 스펙 확정 | 11개 신규 문서 v0.1 완성 |
| 2026-05-04 ~ 05-15 | P1 기반 인프라 + 만세력 엔진 | Monorepo, DB, Auth, 만세력 golden test |
| 2026-05-16 ~ 06-15 | P2 나머지 4엔진 + 해석 레이어 | 자미두수·Goldschneider·MBTI·Enneagram + 템플릿 |
| 2026-06-16 ~ 06-30 | P3 웹 프런트 + 결제 | 리포트 뷰어, 결제, 랜딩 |
| 2026-07-01 ~ 07-15 | P4 클로즈드 베타 | 50~200명, NPS·크래시·UX 피드백 |
| 2026-07-16 ~ 07-31 | P5 정식 오픈 | 공개 출시, 마케팅, 모니터링 안정화 |

---

## 2. P0 — 스펙 확정 (04-20 ~ 05-03, 2주)

### 주간 목표
- 2주 안에 **11개 문서 v0.1 완성** → 이후 코드 작성은 스펙 참조만으로 가능한 수준
- 문서는 서로 간 참조 링크(상대 경로)와 용어 일치성 유지

### 산출물 체크리스트
- [ ] `01-data-model-v0.1.md` (DB 스키마, 프로필/리포트/결제 모델, Drizzle 정의)
- [ ] `11-engine-ziweidoushu-spec-v0.1.md` (자미두수 엔진 계산식·입력·출력·검증)
- [ ] `12-engine-goldschneider-spec-v0.1.md` (48주 매핑 테이블·해석 키워드)
- [ ] `13-engine-mbti-spec-v0.1.md` (자작 문항·채점·IP 회피 전략)
- [ ] `14-engine-enneagram-spec-v0.1.md` (자작 문항·채점·윙 판정)
- [ ] `20-interpretation-layer-spec-v0.1.md` (템플릿 + LLM 하이브리드, 교차 인사이트 규칙)
- [ ] `30-web-frontend-spec-v0.1.md` (Next.js 15 라우팅, 상태, 번들 정책)
- [ ] `40-backend-api-spec-v0.1.md` (tRPC, Auth.js, Rate-limit, 캐시)
- [ ] `50-payments-subscription-spec-v0.1.md` (토스페이먼츠, Stripe, 구독 상태머신)
- [ ] `60-privacy-compliance-spec-v0.1.md` (개인정보보호법, 이용약관, PII 최소화)
- [ ] `90-observability-spec-v0.1.md` (Sentry, PostHog, 로그 구조)

### 병행 Legal
- ARCHE KIPRIS(9·41·42류) + USPTO TESS 조사 (D+1~3)
- arche.app → arche.io → getarche.com → arche.kr WHOIS 확인 및 구매
- MBTI/Enneagram 상표 관련 리서치 (공식 용어 대체 명칭 결정)

### 종료 조건
- 11개 문서 전부 `status: draft` 이상으로 커밋 완료
- ARCHE 상표/도메인 획득 or 백업 플랜 전환 결정 완료

---

## 3. P1 — 기반 인프라 + 만세력 엔진 (05-04 ~ 05-15, 2주)

### 주간 목표
- W1 (05-04~05-10): Repo·CI·DB·Auth 뼈대
- W2 (05-11~05-15): 만세력 엔진 golden test 통과

### W1 — 인프라
- Turborepo + pnpm workspace 초기화
  - `apps/web` (Next.js 15)
  - `packages/engine-manseryeok`
  - `packages/engine-ziweidoushu`
  - `packages/engine-goldschneider`
  - `packages/engine-mbti`
  - `packages/engine-enneagram`
  - `packages/interpretation`
  - `packages/shared` (타입, 토큰, 유틸)
- GitHub Actions: lint/type/test/build matrix
- Supabase(또는 Neon) Postgres 프로비저닝, Drizzle 마이그레이션 파이프라인
- Auth.js v5 (이메일 매직링크 + 카카오 OAuth)
- Sentry + PostHog 연결
- shadcn/ui 초기 셋업, Oatmeal+Terracotta 토큰 주입

### W2 — 만세력 엔진
- [10-engine-manseryeok-spec](./10-engine-manseryeok-spec-v0.1.md) 구현
  - 율리우스일·절기 계산 (Meeus + KASI fallback)
  - 진태양시/한국 경도 이력 보정
  - 연·월·일·시주 산출 (오호둔/오서둔)
  - 자시 3옵션(unified/split/offset30)
  - 대운·세운 산출
- **Golden test 100 케이스 통과 (필수)**
- 공개 API:
  ```typescript
  engine.compute({ birthDateTime, calendar, solarTimeMode, jasiPolicy, gender })
  ```

### 종료 조건
- `pnpm -w test` 전 엔진/팩 통과
- 만세력 결과가 대조군(기존 앱/사이트 3곳)과 95% 이상 일치
- DB 마이그레이션 idempotent 확인

---

## 4. P2 — 나머지 4엔진 + 해석 레이어 (05-16 ~ 06-15, 4.5주)

### W3 (05-16~05-22): 자미두수 엔진
- 12궁 배치, 14주성 배치, 보좌성·살성
- 사화(四化) 산출
- Golden test 50 케이스

### W4 (05-23~05-29): Goldschneider + MBTI
- **Goldschneider:** 48주 매핑 테이블 DB 시드, 키워드/해석 카탈로그
- **MBTI:** 자작 문항 60~80문, 4축 채점, 경계값 처리(5 이내면 혼합형 안내)

### W5 (05-30~06-05): Enneagram + 교차 인사이트
- **Enneagram:** 자작 문항 72~108문, 9유형+윙 판정, 소산형(27소유형)은 v2로
- **교차 인사이트 엔진:** 엔진 간 키워드 충돌/공명 규칙 데이터베이스, 중복 제거 로직

### W6 (06-06~06-12): 해석 레이어 템플릿
- 섹션별 템플릿 (개요·강점·약점·관계·기회·주의)
- LLM 호출 프리셋 (system prompt, few-shot, guardrail)
- 동일 입력 → 동일 출력 보장 (seed 고정, 캐시 테이블)
- 톤 검증 스크립트 (금지어·단정어·확률 표현 체크)

### W7 반나절 (06-13~06-15): 통합 테스트
- 5엔진 → 해석 → 출력까지 E2E
- 실 사용자 3명(개발자·비개발자·디자이너 지인) 샘플 리포트 블라인드 리뷰

### 종료 조건
- 전 엔진 `schemaVersion: 1.0.0` 고정
- 샘플 리포트 3건 품질 리뷰 통과 (블로킹 이슈 0건)

---

## 5. P3 — 웹 프런트 + 결제 (06-16 ~ 06-30, 2주)

### W8 (06-16~06-22): 핵심 화면
- 랜딩 (`/`), 생성 플로우 (`/new`), 설문 (`/survey`), 리포트 뷰어 (`/app/profiles/:id#…`)
- [73-visual-language](./73-visual-language-v0.1.md) 9종 차트 구현
  - C1 원국 표, C2 오행 파이, C3 십신 레이더
  - C4 명반, C5 48주 휠, C6 Enneagram 9각형
  - C7 MBTI 4축 바, C8 Trace Viewer, C9 교차 키워드 맵
- OG 이미지 3종 (Satori 동적 생성)

### W9 (06-23~06-30): 결제 + 마무리
- 토스페이먼츠 통합 (단건 결제 + 빌링키 구독)
- Stripe 병행 (해외 결제 대비)
- 구독 상태머신 (`trial → active → past_due → canceled`)
- 이용약관·개인정보처리방침 페이지
- 접근성 최종 점검 ([74-accessibility](./74-accessibility-v0.1.md))
- Lighthouse/axe CI 통과

### 종료 조건
- 실결제 1건(내 카드)으로 풀사이클 성공
- 환불·취소 플로우 검증

---

## 6. P4 — 클로즈드 베타 (07-01 ~ 07-15, 2주)

### 목표
- 초대제 50~200명, 공개 마케팅 금지
- **핵심 측정:** 크래시율, 완주율(생성→리포트 확인), NPS, 결제 전환, 해석 품질 CSAT

### 모집 채널
- 개인 네트워크, 명리/MBTI 커뮤니티 2~3개 (협의 후)
- 초대 코드 제공 (entitlement: 1개월 무료)

### 운영
- 매일 저녁 Sentry·PostHog 대시보드 리뷰
- 주 2회 유저 인터뷰 (30분, 3~5명)
- 버그 트리아지: Critical은 24h 내, Major는 72h 내

### 종료 조건
- 크래시율 < 0.5%
- NPS ≥ 30
- Critical 버그 0건
- 결제 전환율 데이터 수집 (베이스라인 설정)

---

## 7. P5 — 정식 오픈 (07-16 ~ 07-31, 2주)

### W14 (07-16~07-22): 소프트 오픈
- 베타 피드백 반영 (최우선 Top 10)
- 가격·플랜 최종 고정
- 프로덕션 Supabase 스케일 업
- 백업·복구 플로우 리허설

### W15 (07-23~07-31): 공개 오픈
- 랜딩 공개 버전 배포
- 마케팅 에셋 (SNS 카드, OG, 짧은 영상)
- 콘텐츠 3편 (브랜드 철학, 5엔진 소개, 개인정보 정책)
- 공지: 런칭 할인(1개월)

### 종료 조건
- 정식 도메인 DNS 안정화
- 온콜 모니터링 룰 셋업 (Sentry 알림 → Slack/이메일)
- 주간 KPI 리포트 자동화

---

## 8. 리스크 레지스터

| ID | 리스크 | 영향 | 발생 시 대응 |
|---|---|---|---|
| R1 | ARCHE 상표/도메인 확보 실패 | 브랜드 재작업 | 백업(AELIA/VERA/ORIGO/QUINTA) 전환, 최대 5일 지연 |
| R2 | 만세력 골든 테스트 불일치 | P1 지연 | KASI 데이터 병행 검증, 대조군 변경 |
| R3 | MBTI/Enneagram 상표 이슈 | 명칭 변경 | "성향 4축 분석" / "9가지 원형" 같은 대체 네이밍 사전 준비 |
| R4 | LLM 출력 품질/검열 | 해석 재작성 | 템플릿 비중 상향, LLM은 요약/연결 레이어로 축소 |
| R5 | 베타 크래시율 높음 | 정식 오픈 지연 | 정식 오픈 최대 7일 연기, 엔진 수 유지 / 해석 축소 |
| R6 | 1인 번아웃 | 전체 지연 | 해석 문단 최소치로 축소, 교차 인사이트 v2로 이월 |

---

## 9. 지연 시 트리아지 원칙

> "엔진 수는 5개 유지. 축소는 해석 깊이에서만."

1. **1차 조정:** 섹션별 해석 문단 3 → 2
2. **2차 조정:** 교차 인사이트 카드 5 → 3
3. **3차 조정:** 공유(F7)·관계 궁합(F6) v2 이월
4. **4차 조정:** 정식 오픈을 2026-08-07까지 연장

엔진 제거, 다크모드 앞당김, 네이티브 앱 앞당김은 **금지**.

---

## 10. 주간 운영 리듬

- **월 09:00** 주간 계획 리뷰 (전주 KPI → 이번주 타겟)
- **수 18:00** 미드 체크인 (블로커 트리아지)
- **금 18:00** 데모 & 회고 (셀프, 30분)
- **일 20:00** 다음주 프리뷰 + 체력 점검

---

## 11. 변경 이력

| 날짜 | 버전 | 변경 | 담당 |
|---|---|---|---|
| 2026-04-20 | 0.1 | 최초 작성 (B안 확정 반영) | 솔로 |
