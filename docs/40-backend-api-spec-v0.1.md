---
doc: 40-backend-api-spec
version: 0.1
status: draft
owner: 1인 풀스택
depends_on:
  - 00-architecture-overview-v0.1
  - 01-data-model-v0.1
  - 30-web-frontend-spec-v0.1
scope: 백엔드 API (tRPC), 인증, 레이트 리밋, 캐시
---

# 40. 백엔드 API 스펙

> 단일 Next.js 15 앱에 tRPC v11을 마운트하는 모놀리식 백엔드. 엔진 계산은 동일 프로세스(Node.js 서버 컴포넌트/서버 액션)에서 실행하여 네트워크 왕복 비용을 제거한다.

---

## 1. 런타임·배포

| 항목 | 선택 |
|---|---|
| 런타임 | Node.js 22 (Vercel Serverless Functions) |
| 배포 | Vercel (서울 리전 기본, 미국/일본 장애 대비) |
| DB | Supabase Postgres (또는 Neon) |
| Auth | Auth.js v5 (JWT 세션, DB 어댑터 Drizzle) |
| 캐시 | Vercel KV (Upstash Redis) |
| 이메일 | Resend |
| 로깅·에러 | Sentry + Vercel Logs |

**Edge Runtime 사용 영역:** OG 이미지 생성(`/api/og`), 단순 리다이렉트.
**Node Runtime 사용 영역:** tRPC 라우터, 엔진 계산, 결제 웹훅(원본 바이트 검증 필요).

---

## 2. tRPC 라우터 구조

```
server/
├── trpc.ts                    # initTRPC, middlewares
├── context.ts                 # createContext: { session, db, userId?, ... }
├── routers/
│   ├── _app.ts                # 루트 router
│   ├── auth.ts
│   ├── profile.ts
│   ├── engine.ts              # 엔진 실행 (compute + persist)
│   ├── survey.ts              # MBTI/Enneagram 응답
│   ├── report.ts              # 생성·조회·락·공유
│   ├── interpretation.ts      # 해석 섹션 생성/조회
│   ├── billing.ts             # 구독·단건 결제
│   └── share.ts               # 공유 토큰 관리
└── services/                  # 라우터가 호출하는 도메인 서비스
    ├── engine-runner.ts
    ├── interpretation-runner.ts
    ├── payment-gateway.ts
    └── entitlement.ts
```

---

## 3. 공통 미들웨어

### 3.1 `publicProcedure` / `protectedProcedure`
```typescript
export const publicProcedure = t.procedure.use(rateLimitIp);
export const protectedProcedure = t.procedure
  .use(rateLimitIp)
  .use(requireSession)
  .use(rateLimitUser)
  .use(loadUser);
```

### 3.2 Rate limit
- IP 기반: 분당 60 요청 (미인증 포함)
- User 기반: 분당 120 요청
- 엔진 실행 엔드포인트: User 기반 **분당 10 요청** (DoS 방지)
- LLM 호출 엔드포인트: 일 50회 (남용 방지)

Upstash Redis + sliding window 알고리즘. 키: `rl:{scope}:{id}:{bucket}`.

### 3.3 Zod 입력 검증
- 모든 procedure는 `input(z.object({...}))` 강제.
- 날짜·시간은 `z.string().datetime()` 또는 분해 필드(`year/month/day`).
- 자유 텍스트는 길이 제한 + XSS 정화(DOMPurify, 저장 전).

### 3.4 에러 변환
- 도메인 에러(`EngineError`, `PaymentError`) → `TRPCError` 코드 매핑
- 민감 정보 제거 후 Sentry 전송
- 클라이언트는 `cause`로 사용자 친화 메시지 매핑

---

## 4. 라우터별 엔드포인트

### 4.1 `auth.*`
| Procedure | I/O | 메모 |
|---|---|---|
| `auth.getSession` | () → Session \| null | Server Component용 |
| `auth.requestEmailLink` | email → void | Resend로 매직링크 |
| `auth.signOut` | () → void | |

(로그인 자체는 Auth.js가 `/api/auth/*`로 처리 — tRPC 외부)

### 4.2 `profile.*`
| Procedure | I/O |
|---|---|
| `profile.list` | () → Profile[] |
| `profile.get` | { id } → Profile |
| `profile.create` | NewProfileInput → Profile |
| `profile.update` | { id, patch } → Profile |
| `profile.delete` | { id } → void (soft) |

### 4.3 `engine.*`
| Procedure | I/O | 메모 |
|---|---|---|
| `engine.computeManseryeok` | { profileId } → EngineResult | 캐시 히트 시 재계산 없이 반환 |
| `engine.computeZiweidoushu` | { profileId } → EngineResult | 사주 결과 의존 |
| `engine.computeGoldschneider` | { profileId } → EngineResult | |
| `engine.computeMbti` | { profileId, responseId } → EngineResult | |
| `engine.computeEnneagram` | { profileId, responseId } → EngineResult | |
| `engine.computeAll` | { profileId } → EngineResult[5] | 한 번에 병렬 계산 |

내부 동작:
1. `saju_inputs`에 입력 스냅샷 upsert (hash로 중복 방지)
2. `engine_results`에 `(profile_id, engine_id, engine_version, input_hash)` 조회
3. 히트 → 반환 / 미스 → 엔진 compute → insert → 반환

### 4.4 `survey.*`
| Procedure | I/O |
|---|---|
| `survey.start` | { profileId, instrument } → ResponseId |
| `survey.saveAnswer` | { responseId, questionId, value } → void |
| `survey.complete` | { responseId } → void |
| `survey.getInProgress` | { profileId, instrument } → Response \| null |

### 4.5 `report.*`
| Procedure | I/O |
|---|---|
| `report.create` | { profileId } → Report | 5엔진 준비되지 않으면 에러 |
| `report.get` | { id } → Report | |
| `report.listByProfile` | { profileId } → Report[] |
| `report.lock` | { id } → Report | `locked_at` 세팅, 이후 편집 불가 |
| `report.rename` | { id, title } → Report |

### 4.6 `interpretation.*`
| Procedure | I/O |
|---|---|
| `interpretation.generate` | { reportId, sectionId } → Interpretation |
| `interpretation.get` | { reportId, sectionId } → Interpretation |
| `interpretation.list` | { reportId } → Interpretation[] |

### 4.7 `billing.*` — 자세한 내용은 [50-payments-subscription](./50-payments-subscription-spec-v0.1.md)
| Procedure | I/O |
|---|---|
| `billing.getPlans` | () → Plan[] |
| `billing.createCheckoutSession` | { sku } → { redirectUrl } |
| `billing.getMySubscription` | () → Subscription \| null |
| `billing.cancelSubscription` | { atPeriodEnd: boolean } → Subscription |
| `billing.listInvoices` | () → Invoice[] |

### 4.8 `share.*`
| Procedure | I/O |
|---|---|
| `share.create` | { reportId, scope, expiresIn? } → ShareLink |
| `share.revoke` | { id } → void |
| `share.list` | { reportId } → ShareLink[] |

공유 링크 조회 API는 tRPC가 아니라 **Next.js 페이지**(`/share/[token]`)가 직접 DB 조회.

---

## 5. 엔진 실행 서비스

```typescript
// server/services/engine-runner.ts
export async function runEngine<T extends EngineId>(
  engineId: T,
  profileId: string
): Promise<EngineResult> {
  const input = await buildEngineInput(engineId, profileId);
  const inputHash = hashCanonical(input);

  const cached = await db.query.engineResults.findFirst({
    where: and(
      eq(engineResults.profileId, profileId),
      eq(engineResults.engineId, engineId),
      eq(engineResults.engineVersion, ENGINES[engineId].schemaVersion),
      eq(engineResults.inputHash, inputHash),
    ),
  });
  if (cached) return cached;

  const output = ENGINES[engineId].compute(input);
  const row = await db.insert(engineResults).values({
    id: ulid(),
    profileId,
    engineId,
    engineVersion: ENGINES[engineId].schemaVersion,
    inputHash,
    outputJson: output,
    traceJson: output.trace,
  }).returning().then(r => r[0]);

  return row;
}
```

엔진은 `packages/engine-*`에서 import하여 동일 프로세스에서 실행 — 별도 워커·큐 없음.

### 5.1 장시간 작업
- 만세력은 수 ms, 자미두수는 10ms 이하 — 큐 불필요.
- LLM 호출(해석 생성)은 5~20s 소요 → **Next.js streaming + React Suspense**로 프런트가 대기.
- 향후 30s 초과 시나리오 발생 시 Vercel Background Function 또는 Inngest 도입 고려.

---

## 6. 캐시 전략

| 키 | TTL | 저장소 |
|---|---|---|
| `engine:result:{profileId}:{engineId}:{hash}` | 영구 (DB 원천) | Postgres |
| `report:snapshot:{reportId}` | 7일 | Vercel KV |
| `interpretation:content:{hash}` | 30일 | Vercel KV |
| `plans:list` | 1시간 | Vercel KV |
| `session:{id}` | Auth.js 관리 | Postgres |

---

## 7. 웹훅

### 7.1 토스페이먼츠
- URL: `/api/webhooks/toss`
- 인증: 요청 헤더 `TossPayments-Signature` HMAC 검증
- 본문은 원본 바이트 필요 → Node Runtime 고정, `export const dynamic = "force-dynamic"`, `export const runtime = "nodejs"`
- 수신 즉시 `payment_events`에 raw 저장 → 백그라운드로 상태 전이

### 7.2 Stripe
- URL: `/api/webhooks/stripe`
- 시크릿 검증 `stripe.webhooks.constructEvent`

### 7.3 멱등성
- `payment_events.id` = `provider` + `event_id`(외부) → UNIQUE 제약
- 중복 수신 시 무시

---

## 8. Auth.js v5 구성

- Provider:
  - Email (Resend 매직링크)
  - Kakao OAuth (한국 타겟)
  - Google OAuth (해외 대비)
- 세션: JWT + DB 세션 혼합 (Drizzle adapter)
- 쿠키: `Secure`, `HttpOnly`, `SameSite=Lax`, 도메인 스코프 최소화
- 로그인 성공 시 `audit.events`에 `user.signed_in` 기록

---

## 9. 환경 변수

`apps/web/src/env.ts`에서 `@t3-oss/env-nextjs`로 타입화.

```typescript
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(32),
    AUTH_KAKAO_ID: z.string(),
    AUTH_KAKAO_SECRET: z.string(),
    RESEND_API_KEY: z.string(),
    ANTHROPIC_API_KEY: z.string(),
    TOSS_CLIENT_KEY: z.string(),
    TOSS_SECRET_KEY: z.string(),
    TOSS_WEBHOOK_SECRET: z.string(),
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
    SENTRY_DSN: z.string().url(),
  },
  client: {
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: process.env,
});
```

프로덕션/미리보기/개발 환경별 값은 Vercel 환경 변수로 관리. 로컬은 `.env.local`.

---

## 10. 보안

### 10.1 CORS
- tRPC는 same-origin만 허용 (Next.js 기본)
- 외부 통합이 생기면 API 키 + HMAC 서명 기반

### 10.2 입력 정화
- Zod 1차 검증
- SQL은 Drizzle의 parameterized query만 사용 (raw SQL 금지)
- 유저 자유 텍스트(프로필 닉네임 등)는 저장 전 DOMPurify

### 10.3 비밀관리
- API 키 절대 클라이언트 노출 금지
- Vercel Secrets + `NEXT_PUBLIC_` prefix 철저히 구분

### 10.4 CSRF
- Auth.js의 내장 CSRF 토큰 사용
- 웹훅은 HMAC 검증으로 CSRF 무관

---

## 11. 관찰성

자세한 내용은 [90-observability](./90-observability-spec-v0.1.md). 여기서는 tRPC 계층만:

- 모든 procedure에 `loggerMiddleware`: 실행 시간, 사용자 ID, 입력 요약, 결과 크기 기록
- Sentry: 에러 전파, 성능 트랜잭션(TRPC 절차를 span으로)
- PostHog: 사용자 행동 이벤트 (프런트에서 직접 호출, 서버는 집계만)

---

## 12. 테스트

### 12.1 단위
- 서비스 함수(engine-runner, entitlement) 단위 테스트
- Zod 스키마 경계값 테스트

### 12.2 통합
- In-memory Postgres(`pglite`) 또는 테스트용 Supabase 프로젝트에서 tRPC 라우터 end-to-end
- 모든 procedure 최소 1 happy path + 1 에러 path

### 12.3 E2E
- Playwright가 실제 tRPC 호출을 통해 플로우 검증

---

## 13. 오픈 이슈

1. **tRPC vs Server Actions** — 향후 React Server Actions가 안정화되면 단순 mutation은 이동 가능. v1 유지.
2. **Vercel Serverless 콜드 스타트** — 초기 응답 500~1500ms 변동. 한국 사용자 체감 영향. fly.io로 이전 검토 옵션 열어둠.
3. **DB 커넥션 풀** — Vercel Serverless + Postgres는 Pooler(PgBouncer) 필수. Supabase 기본 pooler 사용.

---

## 14. 변경 이력

| 날짜 | 버전 | 변경 | 담당 |
|---|---|---|---|
| 2026-04-20 | 0.1 | 최초 작성 | 솔로 |
