---
doc: 83-enneagram-type-names
version: 0.1
status: worksheet (초안)
owner: 1인 풀스택
depends_on:
  - 14-engine-enneagram-spec-v0.1
scope: 에니어그램 9유형 자체 한글·영문 네이밍 워크시트
---

# 83. 에니어그램 9유형 네이밍 워크시트

> Riso-Hudson, Hurley-Dobson 등 상업 검사지의 유형명(The Reformer, The Helper 등)은 **차용하지 않는다** ([14-engine-enneagram §0](./14-engine-enneagram-spec-v0.1.md)). 본 워크시트는 각 유형의 공용 지식(핵심 동기·기본 두려움)을 바탕으로 **자체 저술한** 명칭이다.

---

## 1. 원칙

1. 번호(1~9)는 공용 식별자로 **그대로** 사용.
2. 한글명은 **추상 명사** (동기의 본질 표현).
3. 영문명은 `The [Noun]`. Riso-Hudson 명칭 **사용 금지**:
   - Reformer / Helper / Achiever / Individualist / Investigator / Loyalist / Enthusiast / Challenger / Peacemaker **전부 금지**.
4. 트라이어드(본능·감정·사고) 그룹명도 자체 저술.
5. 긍정·긴장 키워드 균형.

---

## 2. 9유형 테이블

| 번호 | 한글명 | 영문명 | 트라이어드 | 핵심 동기 키워드 | 기본 두려움 키워드 |
|---|---|---|---|---|---|
| 1 | 원칙의 축 | The Principled Axis | 본능 | 옳음·개선·성실·절제 | 부패·오류·비난 |
| 2 | 다가가는 손 | The Outreaching Hand | 감정 | 연결·돌봄·유용함·관대 | 무가치함·거부 |
| 3 | 도달하는 동력 | The Reaching Drive | 감정 | 성취·적응·효율·인정 | 실패·무존재감 |
| 4 | 깊은 고유함 | The Distinct Depth | 감정 | 개성·진정성·감수성·의미 | 평범함·결핍 |
| 5 | 거리 있는 관찰 | The Withdrawn Lens | 사고 | 이해·자립·응시·보존 | 무력함·침범 |
| 6 | 경계하는 충성 | The Watchful Bond | 사고 | 안전·책임·동맹·예측 | 버려짐·무방비 |
| 7 | 열린 탐식 | The Open Appetite | 사고 | 자유·가능성·경험·낙관 | 갇힘·결핍감 |
| 8 | 단호한 존재 | The Decisive Presence | 본능 | 주도·보호·강도·직면 | 통제 상실·취약해짐 |
| 9 | 고요한 중심 | The Stilled Center | 본능 | 평화·수용·융화·안정 | 단절·갈등 |

---

## 3. 트라이어드 표기

| 원전 용어 | 자체 한글 | 자체 영문 |
|---|---|---|
| Body/Gut (1·8·9) | 본능 | Grounded Presence |
| Heart/Feeling (2·3·4) | 감정 | Relational Heart |
| Head/Thinking (5·6·7) | 사고 | Reflective Mind |

---

## 4. 윙(Wing) 표기 규칙

- 내부 코드: `1w9`, `1w2` 관용 표기 유지 (식별자용).
- UI 노출: **"{번호} 유형 — {인접 번호} 쪽으로 기울어짐"**
  - 예: "1 유형 — 9 쪽으로 기울어짐"
- 윙 강도(`strength`) 시각화: 0~1 값을 **연한→진한 Terracotta**로 표현.

---

## 5. 통합·분열 방향 카피

각 유형의 화살표 방향을 **운명적 결론** 아닌 **현재 경향**으로 서술.

| 상태 | 카피 예시 |
|---|---|
| 통합 | "안정되었을 때 {번호}유형의 맑은 면이 함께 나타나는 경향이 있습니다." |
| 분열 | "과부하가 걸렸을 때 {번호}유형의 어두운 면이 스며드는 경향이 있습니다." |

**금지 표현:** "반드시 ~하게 됩니다" / "당신의 진짜 모습은 ~" / "숨겨진 자아는 ~".

---

## 6. 경계값 안내 (ambiguity)

[14-engine-enneagram §5](./14-engine-enneagram-spec-v0.1.md) 모호성 상황 UI 문장:

```
"{상위1}번과 {상위2}번의 경향이 비슷하게 측정되었습니다.
두 유형의 핵심 동기를 비교해보시고, 본인의 내적 동기를 더 잘 설명하는 쪽을
주된 해석의 기준으로 삼으시기를 권합니다."
```

---

## 7. 금지 표현 블랙리스트

다음 단어는 9유형 해석문 작성 시 **절대 사용 금지**:

- "당신은 {번호}번이기 때문에 …" (운명 단정)
- "진짜 자아", "숨겨진 본질"
- "치료되어야 할 부분"
- "병적" / "결함" / "장애"
- 원전의 고유 명칭: Reformer, Helper, Achiever, Individualist, Investigator, Loyalist, Enthusiast, Challenger, Peacemaker
- Riso-Hudson의 "Levels of Health" 번호 표기 (저작권)

---

## 8. 검수 체크리스트

- [ ] 9 유형명이 Riso-Hudson·Hurley-Dobson·Palmer 저작물과 **직접 유사도 없음**
- [ ] 트라이어드 그룹명이 원전 용어와 구분됨
- [ ] 윙·화살표 카피에 운명 단정 없음
- [ ] 변리사 1차 저작물 유사도 리뷰
- [ ] 한국어 카피라이터 어감 감수

---

## 9. 다음 단계

1. 각 유형당 `narrativeSeeds` 6~8개 자체 저술 (별도 워크시트 `83a-ennea-narrative-seeds.md`)
2. 해석 레이어 템플릿 연결 ([20-interpretation-layer](./20-interpretation-layer-spec-v0.1.md))
3. 문항셋 v1 81문 작성 ([13,14 엔진 스펙](./14-engine-enneagram-spec-v0.1.md) 설계 원칙 적용)
4. 9 유형별 Terracotta 팔레트 색상 토큰 ([71-design-system](./71-design-system-v0.1.md))

---

## 변경 이력

| 날짜 | 버전 | 변경 | 담당 |
|---|---|---|---|
| 2026-04-20 | 0.1 | 초안, 9유형 + 트라이어드 + 경계/금지 | 솔로 |
