---
doc: 50-payments-subscription-spec
version: 0.1
status: draft
owner: 1인 풀스택
depends_on:
  - 01-data-model-v0.1
  - 40-backend-api-spec-v0.1
scope: 결제·구독 (토스페이먼츠·Stripe)
---

# 50. 결제·구독 스펙

> 국내는 **토스페이먼츠**, 해외/카드 국제결제는 **Stripe** 이중화. 구독은 토스 빌링키 기반이 기본이며, 상태머신은 단일하게 유지한다. 환불·분쟁·보존은 전자상거래법 기준 5년 유지.

---

## 1. 가격 체계 (초기 제안)

| SKU | 설명 | 가격 | 비고 |
|---|---|---|---|
| `plan.monthly_basic` | 월 구독 (전 기능) | 9,900원 | 트라이얼 7일 |
| `plan.yearly_basic` | 연 구독 (-20%) | 95,000원 | |
| `report.single` | 1인 풀 리포트 단건 | 14,900원 | 발급 후 6개월 조회 |
| `report.cross_add` | 교차 인사이트 추가권 | 4,900원 | 기존 리포트 확장 |

정확한 가격·플랜은 베타 피드백 후 확정. 위는 **기준값**.

프리티어(비회원/무료 가입):
- 개요 섹션만 공개
- 교차 인사이트·상세 해석은 유료 게이트

---

## 2. 결제 플로우

### 2.1 단건 결제(Toss — 국내)
1. 클라: `billing.createCheckoutSession({ sku: "report.single" })` 호출
2. 서버: 주문 ID 생성(`one_time_purchases` row `status=pending`) → Toss API 결제 준비 → `redirectUrl` 반환
3. 클라: Toss 결제창 이동 → 성공 시 `successUrl`로 복귀
4. `successUrl` 서버 핸들러: Toss Confirm API 호출 → DB `status=paid`, `report.entitlement` 부여
5. Webhook 수신으로 이중 확인 (실패 시 일관성 맞춤)

### 2.2 구독 결제(Toss 빌링키)
1. 최초 카드 등록: Toss 카드 등록 SDK → `billing_key` 발급
2. `billing.customers`에 암호화 저장 (AES-GCM, 키는 환경변수)
3. 첫 결제 즉시 수행, `subscriptions.status = active`
4. 갱신: 매일 03:00(KST) 크론이 `current_period_end` 지난 활성 구독 조회 → Toss Billing API로 청구 → 성공 시 `current_period_end += 30 days`

### 2.3 단건 결제(Stripe — 해외)
- Stripe Checkout Session 사용
- 한국 원화만 지원하는 카드는 Stripe 실패 → Toss로 자동 안내

### 2.4 구독 결제(Stripe)
- Stripe Subscriptions 사용
- 웹훅이 전이를 주도 (Toss와 동일 상태머신)

---

## 3. 구독 상태머신

```
          ┌─────────┐
          │ trial   │ (7일 무료, 카드 등록됨)
          └────┬────┘
               ▼
   ┌─────────────────────┐
   │      active         │
   └──┬───────────────┬──┘
      │               │
      │   billing     │  cancel_at_period_end=true
      │   실패         │
      ▼               ▼
 ┌──────────┐   ┌──────────┐
 │ past_due │   │ active   │ (기간 종료까지 유지)
 └──┬───────┘   └────┬─────┘
    │                │
    │ 3회 재시도     │ 기간 만료
    │ 실패           │
    ▼                ▼
 ┌──────────┐   ┌──────────┐
 │ canceled │   │ canceled │
 └────┬─────┘   └────┬─────┘
      │              │
      │ 7일 경과     │
      ▼              ▼
 ┌─────────┐
 │ expired │  (entitlement 완전 회수)
 └─────────┘
```

전이 규칙:
- `trial → active`: 트라이얼 종료 시점에 첫 청구 성공
- `active → past_due`: 정기 청구 실패
- `past_due → active`: 3회 내 재시도 성공
- `past_due → canceled`: 3회 실패 or 사용자 취소
- `active → canceled(at_period_end=true)`: 사용자 자발 취소 (기간까지 access 유지)
- `canceled → expired`: `current_period_end + 7일` 경과 (유예 7일간 재활성 허용)

모든 전이는 `audit.events`에 `subscription.transitioned` 기록.

---

## 4. Entitlement 시스템

### 4.1 개념
`entitlement`는 **"이 사용자가 이 기능/리포트에 접근 가능한가"**의 결정 함수.

```typescript
export type Feature =
  | "report.full"
  | "report.cross_insight"
  | "report.engine_trace"
  | "profile.unlimited";

export async function hasEntitlement(
  userId: string,
  feature: Feature,
  targetId?: string  // reportId 등
): Promise<boolean>;
```

### 4.2 결정 순서
1. 활성 구독(`active`, `trial`, `canceled` 중 기간 내) → 전 기능 허용
2. 해당 리포트에 대한 단건 구매 → 그 리포트에 한정 허용
3. 무료 티어 기능 목록 → 해당 시 허용
4. 그 외 → 거부

### 4.3 캐시
- 결과를 Vercel KV에 5분 캐시
- 구독 상태 변경 이벤트 수신 시 해당 사용자 키 무효화

---

## 5. 환불 정책

### 5.1 구독
- 정기 결제 후 **7일 이내**, 서비스 미사용 시 전액 환불 (전자상거래법)
- 이후는 일할 환불 없음(표준 정책). 고객 요청 시 수동 검토.

### 5.2 단건 리포트
- 발급 완료 후 **즉시 사용/다운로드 가능한 콘텐츠**이므로 단순변심 환불 불가
- 단 명백한 계산 오류·서비스 결함 시 전액 환불
- 환불 요청 → `one_time_purchases.status = refunded`, 엔티틀먼트 회수

### 5.3 절차
- 사용자: `/settings/billing`에서 환불 요청 양식
- 운영: 3영업일 내 처리, 결과 이메일(Resend) 통보
- 모든 환불은 `audit.events`에 `refund.processed` 기록

---

## 6. 보안 요구사항

### 6.1 PCI DSS 범위
- **카드 원본 번호 절대 저장·접근 금지.**
- 토스 빌링키·Stripe Customer ID만 저장.
- Toss 빌링키는 **AES-256-GCM 필드 암호화** (전용 KEK는 Vercel 환경변수).

### 6.2 서명·위조 방지
- 결제 성공 후 클라이언트가 서버에 confirm 요청 시 **서버 측 재조회 + 금액 일치 검증** 필수.
- 웹훅 서명 검증 (Toss HMAC-SHA256 / Stripe 공식 라이브러리).

### 6.3 재현성
- 사용자 페이지의 "결제 내역"은 **서버 DB + 영수증 URL(Toss/Stripe)** 이중으로 복원 가능해야 함.

---

## 7. 세금·세금계산서

- 한국 개인 사업자 ↔ 일반 소비자: VAT 10% 포함 가격 표시.
- B2B 세금계산서 발행은 **v1 제외** (수동 처리). v2에 팝빌/공인전자세금계산서 연동 고려.
- 해외 결제는 Stripe Tax 활성화 검토 (최초 6개월은 수동 관리 가능).

---

## 8. 관련 테이블 확장

[01-data-model §6](./01-data-model-v0.1.md)의 billing 스키마에 더해:

### 8.1 `billing.entitlements` (뷰가 아닌 머티리얼라이즈드 테이블)
리포트별·사용자별 엔티틀먼트를 캐싱.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `user_id` | text | |
| `feature` | text | |
| `target_id` | text nullable | |
| `source` | text | `subscription` / `one_time` / `free` |
| `granted_at` | timestamptz | |
| `expires_at` | timestamptz nullable | |
| PK | (user_id, feature, target_id) | |

### 8.2 `billing.refunds`
| 컬럼 | 타입 |
|---|---|
| `id` | text ULID |
| `purchase_id` | text FK (one_time or invoice) |
| `amount_krw` | integer |
| `reason` | text |
| `status` | `requested` / `approved` / `denied` / `processed` |
| `processed_at` | timestamptz |
| `actor_id` | text |

---

## 9. 테스트 전략

### 9.1 유닛
- 상태머신 전이 표 전수 테스트
- 엔티틀먼트 결정 함수: 구독/단건/무료 조합 매트릭스

### 9.2 통합
- **Toss 샌드박스**: 성공·실패·웹훅 누락·환불 각 1회 스크립트 자동화
- **Stripe 테스트 모드**: `tok_visa`, `tok_chargeDeclined`, `evt_` 모의 이벤트
- 결제 후 엔티틀먼트 즉시 반영되는지 E2E

### 9.3 카나리 플로우
- 실제 카드로 소액 결제 → 환불 → 결제 내역 조회까지 매 릴리스 전 수동 1회

---

## 10. 오픈 이슈

1. **부가세 외부 표기** — 현재 포함가. 베타에서 별도 표기 여부 검토.
2. **기프트·코드** — 초대 코드는 베타에서 필요. 쿠폰 테이블 설계 추가 필요 (v1.1).
3. **해외 결제 비중** — 1% 이하 예상. Stripe 유지가 오버엔지니어링인지 재검토 (v1 유지 → 6개월 후 재평가).
4. **빌링키 저장 재위탁 고지** — 토스 약관 상 필요. 이용약관에 반영.

---

## 11. 변경 이력

| 날짜 | 버전 | 변경 | 담당 |
|---|---|---|---|
| 2026-04-20 | 0.1 | 최초 작성 | 솔로 |
