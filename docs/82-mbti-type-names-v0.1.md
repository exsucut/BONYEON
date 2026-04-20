---
doc: 82-mbti-type-names
version: 0.1
status: worksheet (초안)
owner: 1인 풀스택
depends_on:
  - 13-engine-mbti-spec-v0.1
scope: 16유형 자체 한글·영문 네이밍 워크시트
---

# 82. 16유형 네이밍 워크시트 (MBTI 계열)

> 본 워크시트는 4축 자가진단 결과를 표시하기 위한 **자체 네이밍**이다. Myers-Briggs Foundation의 공식 유형명, 16Personalities(NERIS)의 `Architect/Advocate/Commander` 등 상표 문구는 **차용하지 않는다** ([13-engine-mbti §0](./13-engine-mbti-spec-v0.1.md)).

---

## 1. 원칙

1. **"MBTI" 단어를 네이밍에 포함하지 않는다.** 공식 검사와 구별.
2. 16 코드(INTJ 등)는 **사실·공용 약어**로 간주해 병기 허용.
3. 한글명은 **추상 명사구**. "~자"로 끝나는 단정 명사 지양.
4. 영문명은 `The [Noun]` 형식. 16Personalities 단어 회피(Architect·Logician·Commander·Debater·Advocate·Mediator·Protagonist·Campaigner·Logistician·Defender·Executive·Consul·Virtuoso·Adventurer·Entrepreneur·Entertainer **사용 금지**).
5. 각 유형 서술은 **인지기능 심화 없이** 4축의 조합 특성만 반영 (기능 스택 분석은 v2).
6. **긍정·부정 균형**: 키워드는 강점 2~3 + 긴장 1~2.

---

## 2. 16유형 테이블

| 코드 | 한글명 | 영문명 | 핵심 키워드 | 자주 오해되는 점 |
|---|---|---|---|---|
| INTJ | 먼 설계자 | The Far-Sighted | 구상·전략·고독감·인내 | 무심해 보이지만 내면은 강한 책임감 |
| INTP | 순환하는 사유 | The Circling Thought | 탐구·모형·분해·무관심 | 관심 있는 주제에만 몰입 |
| ENTJ | 지휘의 호흡 | The Grand Tempo | 조직·결단·속도·고강도 | 감정을 덜 드러내는 것이 공감 부재는 아님 |
| ENTP | 반전의 기수 | The Pivoter | 아이디어·도전·논쟁·유희 | 반박이 공격이 아니라 사고 도구 |
| INFJ | 조용한 조율 | The Quiet Tuner | 통찰·사명·민감·고갈 | 이상주의와 현실적 실행의 공존 |
| INFP | 깊은 결 | The Inward Grain | 가치·상상·진심·흔들림 | 무르게 보여도 가치 앞에서는 단단함 |
| ENFJ | 환한 촉매 | The Warm Catalyst | 격려·영향·비전·부담 | 타인을 돌보는 만큼 자신도 돌봐야 함 |
| ENFP | 열린 호기 | The Open Spark | 열정·연결·상상·산만 | 가볍다기보다 폭이 넓은 것 |
| ISTJ | 성실한 축 | The Steady Pillar | 책임·정확·보존·완고 | 유연함 부족이 아니라 신중함 |
| ISFJ | 따뜻한 유지 | The Gentle Keeper | 헌신·기억·배려·과부하 | 말수 적어도 관찰은 섬세 |
| ESTJ | 질서의 운영자 | The Prime Operator | 실행·체계·권위·경직 | 원칙 고수가 관계 거부는 아님 |
| ESFJ | 결속의 주파수 | The Binding Host | 화합·감정지능·책임·평판의식 | 배려가 지나쳐 자기 소진 위험 |
| ISTP | 조용한 기술자 | The Silent Tinker | 실용·즉흥·분석·거리감 | 감정 표현이 적을 뿐 감각은 예민 |
| ISFP | 잔잔한 미감 | The Soft Palette | 감각·조율·자유·회피 | 온순함 뒤의 뚜렷한 주관 |
| ESTP | 즉각의 리드 | The Live Charge | 순발력·행동·담대·소란 | 즉흥성이 경솔과 동의어는 아님 |
| ESFP | 빛나는 합주 | The Bright Ensemble | 활력·공감·현장·몰입의 쏠림 | 진지한 내면도 깊게 존재 |

---

## 3. 축별 표현 규칙

UI에 "축 결과"를 별도 노출할 때 사용할 라벨. 4축 중 어느 쪽으로 기울었는지를 **그라데이션**으로 보여주기 위한 카피.

| 축 | + 라벨 | - 라벨 | 중심 라벨 |
|---|---|---|---|
| E/I | 바깥으로 뻗는 에너지 | 안으로 모이는 에너지 | 상황에 따라 균형 |
| S/N | 구체·감각 중심 | 맥락·직관 중심 | 사안별 혼합 |
| T/F | 일관된 기준 | 관계·맥락 기준 | 상황별 가변 |
| J/P | 구조·마감 선호 | 유연·열린 선호 | 혼합 |

*주의: "내향/외향" 같은 공용어는 사용 가능하되, **"사회성 부족"·"리더십 부족" 같은 부정적 연상** 금지.*

---

## 4. 경계값 안내 문구

[13-engine-mbti §6 경계값 처리](./13-engine-mbti-spec-v0.1.md)가 발동될 때 UI에 표시할 문장 템플릿.

```
"{축이름} 축에서 {한쪽}과 {반대쪽}의 경향이 가깝게 측정되었습니다.
상황과 시기에 따라 두 방향이 모두 나타날 수 있습니다.
두 가능성 모두 염두에 두시기를 권합니다."
```

예:
- "E/I 축에서 바깥으로 뻗는 에너지와 안으로 모이는 에너지가 가깝게 측정되었습니다. …"

---

## 5. 한글 표기 정책

- 16코드(INTJ 등)는 **대문자 영문** 그대로 노출.
- 한글명과 영문명 병기 시: `먼 설계자 / INTJ` (영문 코드는 식별자, 한글명은 설명).
- 16Personalities의 색상코드(보라·녹색·청·노랑 군집)는 따르지 않고, 본 프로젝트 Terracotta 팔레트 내에서 8단계 채도 변이로 구분.

---

## 6. 검수 체크리스트

- [ ] 한글명 16개 모두 16Personalities(NERIS), Myers-Briggs 공식, 일본/중국 파생 네이밍과 **직접 유사도 없음** 확인
- [ ] "MBTI" 단어가 제품 네이밍·슬로건·광고에 노출되지 않음
- [ ] 축 라벨에 부정 편향 없음
- [ ] 스크린 리더 읽기 테스트 통과 (한자 병기 없음)
- [ ] 변리사 1차 저작물 유사도 리뷰

---

## 7. 다음 단계

1. 카피라이터 감수 (1회, ₩150K)
2. Terracotta 팔레트 내 16유형 색상 토큰 설계 ([71-design-system](./71-design-system-v0.1.md) 반영)
3. 각 유형 `narrativeSeeds` 5~8개 자체 저술 (별도 워크시트)
4. 해석 레이어 템플릿 연결 ([20-interpretation-layer](./20-interpretation-layer-spec-v0.1.md))

---

## 변경 이력

| 날짜 | 버전 | 변경 | 담당 |
|---|---|---|---|
| 2026-04-20 | 0.1 | 초안, 16유형 + 축 라벨 | 솔로 |
