---
doc: 90-observability-spec
version: 0.1
status: draft
owner: 1인 풀스택
depends_on:
  - 40-backend-api-spec-v0.1
  - 60-privacy-compliance-spec-v0.1
scope: 로그·에러·메트릭·제품 분석
---

# 90. 관찰성(Observability) 스펙

> 1인 운영 환경에서도 "원인까지 5분 내 도달"을 목표로 한다. Sentry(에러·성능), PostHog(제품 분석), Vercel Logs(구조화 로그), 외형 헬스체크(Better Uptime 류)의 4계층.

---

## 1. 관찰성의 3축

| 축 | 도구 | 저장 | 용도 |
|---|---|---|---|
| 로그 (Logs) | pino → Vercel Logs | Vercel (30일) | 디버깅·사후 분석 |
| 메트릭 (Metrics) | Vercel Analytics + 커스텀 dashboard | 90일 | 트렌드·SLO |
| 추적 (Traces) | Sentry Performance | 30일 | 느린 요청 원인 |
| 제품 분석 | PostHog | 1년 | 전환·코호트 |
| 외형 감시 | Better Uptime | 90일 | 가동률·장애 탐지 |

---

## 2. 로그 정책

### 2.1 포맷
JSON 한 줄 단위 (pino). 필드:

```json
{
  "time": "2026-05-16T03:14:25.123Z",
  "level": "info",
  "service": "arche-web",
  "env": "production",
  "traceId": "abc...",
  "userId": "usr_...",
  "requestId": "req_...",
  "route": "trpc.report.create",
  "durationMs": 143,
  "msg": "report.created"
}
```

- `traceId`·`requestId`는 Sentry와 공통 — 에러 ↔ 로그 교차 조회 가능.
- `userId`는 ULID만. 이메일·이름은 **로그에 절대 포함 금지**.

### 2.2 레벨
- `error`: 예외 발생 (Sentry 자동 수집)
- `warn`: 비정상 동작이지만 복구됨 (재시도 성공 등)
- `info`: 주요 비즈니스 이벤트 (리포트 생성, 결제 성공 등)
- `debug`: 개발 환경에서만 사용, 프로덕션 비활성

### 2.3 PII 스크러빙
- pino redaction rule: `email`, `password`, `token`, `billing_key`, `card.*`, `ip` 마스킹
- 에러 객체는 stack trace + 메타만, 본문 payload는 제외
- 프런트 로그는 `console.*` 사용 금지 (eslint rule) → 전용 `logger.client.ts`

---

## 3. 에러 추적 (Sentry)

### 3.1 설치 범위
- Next.js 웹: `@sentry/nextjs`
- 서버 런타임(Node) + 브라우저 런타임 모두
- Source map 업로드 (릴리스 빌드 단계)

### 3.2 릴리스·환경 태깅
- `release`: `arche-web@{gitSha}`
- `environment`: `production` / `preview` / `development`
- `tags`: `route`, `engineId`, `plan`

### 3.3 샘플링
- Error: 100%
- Performance trace: 프로덕션 10%, 프리뷰 100%
- Session replay: **미활성** (프라이버시 고려)

### 3.4 경보
- Slack `#alerts-prod` 채널:
  - 5xx 에러 1분 내 10건 초과
  - 신규 이슈 태어남 (첫 발생)
  - Crash-free session < 99.5%

---

## 4. 메트릭·SLO

### 4.1 핵심 지표
| SLI | SLO | 윈도우 |
|---|---|---|
| 가용성(루트 `/`, 200 응답) | 99.5% | 30일 |
| 리포트 생성 성공률 | 99.0% | 7일 |
| 결제 성공률 | 98.0% | 7일 |
| LLM 응답 지연 p95 | < 12s | 7일 |
| tRPC 에러율 | < 1% | 24시간 |
| Lighthouse Performance | ≥ 85 | 주간 |

### 4.2 커스텀 메트릭
- `engine_compute_duration_ms{engineId}`
- `interpretation_generate_duration_ms{sectionId, generator}`
- `llm_cache_hit_rate`
- `payment_transition_total{from, to, status}`
- `subscription_active_total{plan}`

수집은 간단한 테이블(`metrics_hourly`)에 Cron으로 집계, Dashboard는 Metabase 또는 Grafana Cloud에 연결.

### 4.3 Error Budget
- 월 에러 예산 = 1 - SLO. 예산 소진 시 **신기능 배포 중단**, 안정화 주간 전환.

---

## 5. 제품 분석 (PostHog)

### 5.1 이벤트 스키마
이벤트 이름: `{domain}.{noun}.{verb}` (snake_case).

| 이벤트 | 속성 | 발생 위치 |
|---|---|---|
| `auth.user.signed_up` | method | 클라 |
| `profile.profile.created` | calendarType, hasTime | 클라 |
| `survey.mbti.completed` | durationSec, itemCount | 클라 |
| `report.report.generated` | engineCount, locked | 서버 |
| `billing.checkout.started` | sku, provider | 클라 |
| `billing.payment.succeeded` | sku, amount_krw | 서버 |
| `share.link.created` | scope, expires | 클라 |
| `share.link.viewed` | via | 서버 |

### 5.2 금지 속성
- 실명, 이메일 원문, 생년월일 원문, IP, 정확 위치, 결제 카드 정보
- `distinct_id`는 사용자 ULID로 매핑 (이메일 ❌)

### 5.3 필터·코호트
- 코호트: 신규 가입자(7일), 결제 전환자, 구독 취소자, 교차 인사이트 열람자
- 퍼널: 랜딩 → 프로필 생성 → 설문 완료 → 리포트 열람 → 결제

### 5.4 피처 플래그
PostHog Feature Flags 사용.
- 실험적 기능(예: 새 교차 룰 세트) 10% 롤아웃
- 개인화 가격 실험은 **비활성** (공정성 우려)

---

## 6. 외형 감시

Better Uptime 또는 UptimeRobot:
- 대상: `/`, `/api/health`, `/api/webhooks/toss` (GET 405 허용 체크)
- 주기: 1분
- 알림: 이메일 + Slack + 음성 통화(1인 운영)

헬스체크 엔드포인트 `/api/health`:
```json
{
  "status": "ok",
  "version": "arche-web@sha-abc",
  "dependencies": {
    "db": "ok",
    "redis": "ok",
    "anthropic": "ok"
  },
  "now": "2026-05-16T03:14:25Z"
}
```

의존성 체크는 5초 타임아웃. 하나라도 `degraded` 시 200 유지하되 상태 필드 반영.

---

## 7. 대시보드

1인 운영이므로 **과도한 대시보드 금지**. 다음 3개만:

### 7.1 Ops Dashboard (하루 1번 조회)
- 지난 24h 5xx 카운트
- Crash-free session
- 결제 성공률
- 활성 구독 증감
- SLO 버짓 소진율

### 7.2 Product Dashboard (주 1번)
- 가입·전환 퍼널
- 리포트 생성 수
- 교차 인사이트 열람률
- NPS (베타 기간)

### 7.3 Cost Dashboard (주 1번)
- Vercel·Supabase·Upstash·Sentry·PostHog·Anthropic 월 누적 비용
- LLM 토큰 사용량
- 예산 초과 경보

---

## 8. 온콜

1인 운영 현실:
- **콜크리티컬 알림(PagerDuty급)**: 결제 실패율 급증, 가용성 < 95%, 데이터 유실 징후
- **비콜**: 나머지 모두 → 업무 시간에 처리
- 음성 통화 알림은 최대 주당 2회 예산 (피로 관리)

on-call runbook: `docs/runbooks/` (본 문서 시리즈 외 별도 경로에 계속 축적)

---

## 9. 테스트·드릴

### 9.1 Chaos 가벼운 버전
- 월 1회 DB/Redis 의존성 일시 차단 → 에러 메시지·재시도·사용자 UX 확인
- 웹훅 누락 시나리오: 토스 샌드박스에서 의도적으로 웹훅 미도달 → 재동기화 플로우 검증

### 9.2 데이터 복구 리허설
- 분기 1회: Supabase PITR으로 임의 시점 복구 → 백업본에서 테스트 환경 구축

---

## 10. 보안 로깅

- 관리자 접근: 모든 관리자 엔드포인트 호출을 `audit.events`에 `admin.*`로 기록
- 로그인 실패: 레이트 리밋 + 로그
- 비정상 대량 쿼리(한 사용자가 1분간 100회 초과): 자동 차단 + 알림

---

## 11. 비용 가드

| 항목 | 월 한도(경보) | 한도(자동 차단) |
|---|---|---|
| LLM (Anthropic) | $150 | $300 (요청 반려) |
| Supabase 쿼리 | 사용량 기반 | - |
| Vercel | $100 | $200 |
| Upstash Redis | $20 | $50 |
| Sentry | $26 (Team) | - |
| PostHog | $0 (무료 티어) | 한도 도달 시 샘플링 조정 |

한도 근접 시 Slack 경보, 초과 시 자동 차단(LLM만 해당 구현).

---

## 12. 오픈 이슈

1. **로그 장기 보관** — 현재 30일. 규제·분쟁 대비 일부는 S3 아카이브 필요 여부 검토 (v1.1).
2. **OpenTelemetry 도입** — Sentry로 충분 시 보류. 멀티 서비스 전환 시 재검토.
3. **Grafana Cloud 전환 비용** — 무료 티어(10k 시리즈) 내에서 커스텀 메트릭 운영 가능성.

---

## 13. 변경 이력

| 날짜 | 버전 | 변경 | 담당 |
|---|---|---|---|
| 2026-04-20 | 0.1 | 최초 작성 | 솔로 |
