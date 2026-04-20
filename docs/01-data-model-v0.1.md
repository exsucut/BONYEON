---
doc: 01-data-model
version: 0.1
status: draft
owner: 1인 풀스택
depends_on:
  - 00-architecture-overview-v0.1
  - 10-engine-manseryeok-spec-v0.1
scope: 데이터 모델 (DB 스키마·엔티티·정책)
---

# 01. 데이터 모델

> PostgreSQL + Drizzle ORM 기준. 모든 테이블은 `snake_case`, 엔티티 타입은 TypeScript `PascalCase`. PII 최소화와 불변 로그(append-only)를 원칙으로 한다.

---

## 1. 설계 원칙

1. **PII 최소화** — 이름은 필수 아님(표시용 닉네임으로 대체 가능), 이메일만 필수.
2. **엔진 결과는 불변** — 같은 입력·같은 `schemaVersion`이면 항상 같은 출력. 재계산이 아니라 재조회.
3. **감사 가능(auditable)** — 결제, 동의, 구독 상태 변경은 이벤트 테이블(append-only)로 기록.
4. **소프트 삭제** — `deleted_at` 컬럼 사용. 실제 삭제는 개인정보 파기 요청 시 크론으로.
5. **참조 정합성** — FK 사용, `ON DELETE`는 명시적으로(기본 `RESTRICT`).
6. **시간은 UTC** — 앱 레이어에서 Asia/Seoul 변환.
7. **ID는 ULID** — 시간 정렬 가능하고 URL 안전. Postgres에 `text` 컬럼 + CHECK 제약.

---

## 2. 엔티티 맵

```
auth.users ── profiles ── saju_inputs ── engine_results ── reports
                │                              │
                ├── consents                   └── interpretations
                ├── mbti_responses
                ├── enneagram_responses
                └── shares

billing.customers ── subscriptions ── invoices ── payment_events
                  └── one_time_purchases

audit_events (append-only, 모든 중요 이벤트)
```

스키마 분리: `auth`, `app`, `billing`, `audit`.

---

## 3. 공통 컬럼 규약

모든 테이블에 다음 컬럼 존재 (특별한 이유가 없으면):

| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | `text` (ULID) | PK |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | trigger로 자동 갱신 |
| `deleted_at` | `timestamptz` nullable | soft delete |

`audit_events` 같은 append-only 테이블은 `updated_at`, `deleted_at` 없음.

---

## 4. 인증 (`auth` 스키마)

Auth.js v5가 관리하는 표준 테이블(users, accounts, sessions, verification_tokens). 커스텀 컬럼만 정리:

### 4.1 `auth.users`
| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | text ULID | PK |
| `email` | citext UNIQUE NOT NULL | 로그인 식별자 |
| `email_verified` | timestamptz | |
| `display_name` | text | 닉네임 (표시용) |
| `locale` | text default `'ko-KR'` | |
| `marketing_opt_in` | boolean default false | |
| `created_at`·`updated_at`·`deleted_at` | | |

인덱스: `UNIQUE(email) WHERE deleted_at IS NULL`.

---

## 5. 앱 코어 (`app` 스키마)

### 5.1 `app.profiles`
사주 계산 대상이 되는 "한 사람"의 생년월일시 정보. 한 유저가 여러 프로필(본인·가족·친구) 보유 가능.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | text ULID | |
| `user_id` | text FK auth.users ON DELETE CASCADE | |
| `nickname` | text NOT NULL | "나", "엄마" 등 |
| `relationship` | text | `self`/`family`/`partner`/`friend`/`other` |
| `gender` | text | `male`/`female`/`unspecified` |
| `birth_date` | date NOT NULL | |
| `birth_time` | time | NULL이면 시주 미정 |
| `birth_time_known` | boolean NOT NULL default true | false면 자시 정책 무시 |
| `calendar_type` | text NOT NULL | `solar`/`lunar_regular`/`lunar_leap` |
| `birth_place_name` | text | "서울", "부산" 등 표시용 |
| `birth_longitude` | numeric(8,5) | 진태양시 보정용 |
| `birth_timezone` | text NOT NULL default `'Asia/Seoul'` | IANA TZ |
| `solar_time_mode` | text NOT NULL default `'true_solar'` | `true_solar`/`standard` |
| `jasi_policy` | text NOT NULL default `'unified'` | `unified`/`split`/`offset30` |
| `created_at`·`updated_at`·`deleted_at` | | |

CHECK: `calendar_type IN (...)`, `gender IN (...)`, `solar_time_mode IN (...)`, `jasi_policy IN (...)`, `relationship IN (...)`.
인덱스: `(user_id, created_at DESC) WHERE deleted_at IS NULL`.

### 5.2 `app.saju_inputs`
프로필에서 도출한 만세력 엔진의 **정규화된 입력**. 프로필 편집 시 새 row 생성(이전 입력 보존).

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | text ULID | |
| `profile_id` | text FK | |
| `engine_version` | text NOT NULL | `manseryeok@1.0.0` |
| `input_hash` | text NOT NULL | sha256(canonical JSON) |
| `input_json` | jsonb NOT NULL | 엔진 입력 스냅샷 |
| `created_at` | | |

인덱스: `UNIQUE(profile_id, engine_version, input_hash)` — 동일 입력 중복 방지.

### 5.3 `app.engine_results`
5개 엔진의 실행 결과. `(input_hash, engine_id, engine_version)`에 대한 캐시 역할.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | text ULID | |
| `profile_id` | text FK | |
| `engine_id` | text NOT NULL | `manseryeok`/`ziweidoushu`/`goldschneider`/`mbti`/`enneagram` |
| `engine_version` | text NOT NULL | SemVer |
| `input_hash` | text NOT NULL | |
| `output_json` | jsonb NOT NULL | |
| `trace_json` | jsonb | 계산 근거 (transparency) |
| `computed_at` | timestamptz NOT NULL default now() | |

인덱스:
- `UNIQUE(profile_id, engine_id, engine_version, input_hash)`
- `(profile_id, engine_id, computed_at DESC)`

### 5.4 `app.mbti_responses`, `app.enneagram_responses`
설문 응답. 점수화 엔진의 입력이 되는 raw 데이터.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | text ULID | |
| `profile_id` | text FK | |
| `instrument_version` | text NOT NULL | `mbti@1`, `enneagram@1` |
| `answers_json` | jsonb NOT NULL | `[{questionId, value}]` |
| `duration_seconds` | integer | UX 통계용 |
| `completed_at` | timestamptz | NULL이면 진행중 |
| `created_at`·`updated_at` | | |

### 5.5 `app.reports`
엔진 결과들을 묶어 한 사용자에게 노출하는 "리포트" 단위. 동일 프로필에 대해 버전이 쌓인다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | text ULID | |
| `profile_id` | text FK | |
| `report_version` | text NOT NULL | `v1.0` 등 |
| `engine_result_ids` | text[] NOT NULL | 포함된 엔진 결과 5개 |
| `cross_insights_json` | jsonb | 교차 인사이트 산출 결과 |
| `locked_at` | timestamptz | 발행 완료 시각 (이후 불변) |
| `created_at`·`updated_at` | | |

인덱스: `(profile_id, locked_at DESC NULLS LAST)`.

### 5.6 `app.interpretations`
해석 레이어가 만들어낸 사람이 읽을 수 있는 텍스트. LLM/템플릿 출력 캐시.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | text ULID | |
| `report_id` | text FK | |
| `section_id` | text NOT NULL | `overview`/`strength`/`weakness`/`relationship`/`opportunity`/`caution`/`cross` |
| `template_version` | text NOT NULL | |
| `generator` | text NOT NULL | `template` 또는 `template+llm` |
| `model_id` | text | LLM 사용 시 (예: `claude-opus-4-7`) |
| `prompt_hash` | text | 재현성 확인용 |
| `content_md` | text NOT NULL | 본문 (Markdown) |
| `lint_passed` | boolean NOT NULL | 톤/금지어 검증 |
| `created_at` | | |

인덱스: `UNIQUE(report_id, section_id, template_version)`.

### 5.7 `app.shares`
리포트 공유 링크 (F7 플로우).

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | text ULID | |
| `report_id` | text FK | |
| `share_token` | text UNIQUE NOT NULL | URL-safe random 22자 |
| `scope` | text NOT NULL | `overview_only`/`full` |
| `expires_at` | timestamptz | NULL이면 무기한 |
| `view_count` | integer default 0 | |
| `revoked_at` | timestamptz | |
| `created_at` | | |

### 5.8 `app.consents`
개인정보·민감정보 동의 이력. PIPA 대응.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | text ULID | |
| `user_id` | text FK | |
| `kind` | text NOT NULL | `tos`/`privacy`/`sensitive_bio_data`/`marketing` |
| `version` | text NOT NULL | 약관 버전 |
| `granted` | boolean NOT NULL | |
| `granted_at` | timestamptz NOT NULL | |
| `ip_hash` | text | SHA256(IP + salt) — 원문 저장 금지 |
| `user_agent_hash` | text | 동일 |

append-only. 철회는 같은 `kind`의 `granted=false` row 추가로 표현.

---

## 6. 결제 (`billing` 스키마)

### 6.1 `billing.customers`
PG사(토스페이먼츠/Stripe)별 고객 매핑.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | text ULID | |
| `user_id` | text FK | |
| `provider` | text NOT NULL | `toss`/`stripe` |
| `provider_customer_id` | text NOT NULL | |
| `billing_key` | text | 토스 빌링키 (암호화 저장) |
| `created_at`·`updated_at` | | |

UNIQUE(`provider`, `provider_customer_id`).

### 6.2 `billing.subscriptions`
| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | text ULID | |
| `user_id` | text FK | |
| `customer_id` | text FK billing.customers | |
| `plan_code` | text NOT NULL | `monthly_basic`/`yearly_basic` |
| `status` | text NOT NULL | `trial`/`active`/`past_due`/`canceled`/`expired` |
| `current_period_start` | timestamptz NOT NULL | |
| `current_period_end` | timestamptz NOT NULL | |
| `cancel_at_period_end` | boolean default false | |
| `canceled_at` | timestamptz | |
| `trial_ends_at` | timestamptz | |
| `created_at`·`updated_at` | | |

인덱스: `(user_id, status)`.

### 6.3 `billing.one_time_purchases`
리포트 1회 결제.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | text ULID | |
| `user_id` | text FK | |
| `sku` | text NOT NULL | `report_full`/`report_section_cross` 등 |
| `report_id` | text FK app.reports | 어떤 리포트에 귀속 |
| `amount_krw` | integer NOT NULL | |
| `status` | text NOT NULL | `pending`/`paid`/`refunded`/`failed` |
| `paid_at` | timestamptz | |
| `created_at`·`updated_at` | | |

### 6.4 `billing.invoices`, `billing.payment_events`
- `invoices`: 구독 청구서. 각 주기마다 1개.
- `payment_events`: 토스/Stripe 웹훅 원본 payload 저장 (append-only). `provider`, `event_type`, `raw_json`, `received_at`, `processed_at`, `processing_error`.

---

## 7. 감사 (`audit` 스키마)

### 7.1 `audit.events`
앱 전반의 중요 이벤트를 기록. 디버깅·분쟁 해결·규제 대응용.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | text ULID | |
| `actor_type` | text | `user`/`system`/`webhook` |
| `actor_id` | text | |
| `action` | text NOT NULL | `profile.created`/`report.locked`/`subscription.canceled` 등 도트 네이밍 |
| `target_type` | text | |
| `target_id` | text | |
| `metadata_json` | jsonb | |
| `occurred_at` | timestamptz NOT NULL default now() | |

인덱스: `(action, occurred_at DESC)`, `(actor_id, occurred_at DESC)`.

파티셔닝: 월 단위 range partition (1년 후 도입, 초기에는 단일 테이블).

---

## 8. 엔트리타입 요약 (TypeScript)

Drizzle 정의에서 추론되는 타입 예시 (완전한 정의는 `packages/shared/src/schema.ts`에 둠).

```typescript
export type Profile = InferSelectModel<typeof profiles>;
export type NewProfile = InferInsertModel<typeof profiles>;

export interface EngineResult<TOutput = unknown, TTrace = unknown> {
  id: string;
  profileId: string;
  engineId: EngineId;
  engineVersion: string;
  inputHash: string;
  output: TOutput;
  trace?: TTrace;
  computedAt: Date;
}

export type EngineId =
  | "manseryeok"
  | "ziweidoushu"
  | "goldschneider"
  | "mbti"
  | "enneagram";

export type SubscriptionStatus =
  | "trial" | "active" | "past_due" | "canceled" | "expired";
```

---

## 9. 마이그레이션 전략

1. **Drizzle Kit** 사용. `drizzle/` 폴더에 `YYYYMMDD_HHmm_description.sql` 형식.
2. 모든 마이그레이션은 **idempotent** (CREATE IF NOT EXISTS 등).
3. **파괴적 변경 금지** — 컬럼 rename/drop 대신 "새 컬럼 추가 → 데이터 백필 → 읽기 전환 → 구 컬럼 제거"의 3 릴리스 분할.
4. **프로덕션 배포 순서:** 스키마 선행 → 앱 배포 → 구 스키마 제거(다음 릴리스).
5. **seed 데이터:** `seeds/` 폴더. Goldschneider 48주 매핑, 절기 테이블(엔진 내부), MBTI/Enneagram 문항.

---

## 10. 보존·파기 정책

| 데이터 | 보존 기간 | 비고 |
|---|---|---|
| `auth.users` | 탈퇴 시 soft delete → 30일 후 hard delete 크론 | |
| `app.profiles`·연관 데이터 | 유저 삭제와 함께 | |
| `billing.invoices`·`payment_events` | **5년** | 전자상거래법 |
| `audit.events` | **3년** | |
| `app.consents` | 유저 삭제 후에도 **3년** | 분쟁 대비 |

자세한 PIPA 대응은 [60-privacy-compliance](./60-privacy-compliance-v0.1.md) 참조.

---

## 11. 인덱스·성능 노트

- 주요 조회 경로: `profile → engine_results 최신 5건` — 커버링 인덱스로 해결.
- `audit.events`와 `payment_events`는 write-heavy이므로 인덱스 최소화.
- jsonb 필드는 기본 GIN 인덱스 미적용. 실제 쿼리가 생기면 그때 추가.
- `input_hash` 기반 캐시 히트가 핵심 — 엔진 결과 재사용률이 성능·비용 양쪽에 직결.

---

## 12. 변경 이력

| 날짜 | 버전 | 변경 | 담당 |
|---|---|---|---|
| 2026-04-20 | 0.1 | 최초 작성 | 솔로 |
