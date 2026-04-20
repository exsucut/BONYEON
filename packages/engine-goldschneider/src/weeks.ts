// 48주 원형 매핑 테이블.
// docs/12-engine-goldschneider-spec-v0.1.md §4
// docs/81-goldschneider-archetype-names-v0.1.md (자체 네이밍)
//
// 각 엔트리: 태양 별자리 × 데케이트(I/II/III) + 12개의 경계(Cusp).
// 총 48개. 날짜는 전통 점성학 공유 분할(±1일 변동은 v0.1 허용).

export type SunSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export type Decanate = 1 | 2 | 3;

export interface WeekDefinition {
  readonly id: number; // 1..48
  readonly weekKey: string;
  readonly startMonth: number;
  readonly startDay: number;
  readonly endMonth: number;
  readonly endDay: number;
  readonly sunSign: SunSign;
  readonly decanate: Decanate | null; // null = cusp
  readonly isCusp: boolean;
  readonly cuspOf?: readonly [SunSign, SunSign];
  readonly nameKo: string;
  readonly nameEn: string;
  readonly keywords: readonly string[];
  readonly growthAxis: string;
}

export const WEEKS: readonly WeekDefinition[] = [
  { id: 1, weekKey: "pisces-aries-cusp", startMonth: 3, startDay: 19, endMonth: 3, endDay: 24, sunSign: "aries", decanate: null, isCusp: true, cuspOf: ["pisces", "aries"], nameKo: "환류의 경계", nameEn: "The Threshold", keywords: ["경계", "전환", "용기"], growthAxis: "꿈에서 행동으로" },
  { id: 2, weekKey: "aries-i", startMonth: 3, startDay: 25, endMonth: 4, endDay: 2, sunSign: "aries", decanate: 1, isCusp: false, nameKo: "첫 점화", nameEn: "The Kindling", keywords: ["즉발", "개시", "단호"], growthAxis: "충동에서 주도로" },
  { id: 3, weekKey: "aries-ii", startMonth: 4, startDay: 3, endMonth: 4, endDay: 10, sunSign: "aries", decanate: 2, isCusp: false, nameKo: "추진의 궤도", nameEn: "The Thrust", keywords: ["추진", "경쟁", "돌파"], growthAxis: "맞섬에서 설득으로" },
  { id: 4, weekKey: "aries-iii", startMonth: 4, startDay: 11, endMonth: 4, endDay: 18, sunSign: "aries", decanate: 3, isCusp: false, nameKo: "개척의 호흡", nameEn: "The Vanguard", keywords: ["선도", "자립", "리스크"], growthAxis: "고립에서 연대로" },
  { id: 5, weekKey: "aries-taurus-cusp", startMonth: 4, startDay: 19, endMonth: 4, endDay: 24, sunSign: "taurus", decanate: null, isCusp: true, cuspOf: ["aries", "taurus"], nameKo: "뿌리내린 불", nameEn: "The Fused", keywords: ["강도", "지속", "물성"], growthAxis: "힘에서 결실로" },
  { id: 6, weekKey: "taurus-i", startMonth: 4, startDay: 25, endMonth: 5, endDay: 2, sunSign: "taurus", decanate: 1, isCusp: false, nameKo: "견고의 씨앗", nameEn: "The Seedbed", keywords: ["축적", "감각", "신뢰"], growthAxis: "안주에서 축조로" },
  { id: 7, weekKey: "taurus-ii", startMonth: 5, startDay: 3, endMonth: 5, endDay: 10, sunSign: "taurus", decanate: 2, isCusp: false, nameKo: "풍요의 결", nameEn: "The Grain", keywords: ["미감", "충만", "집요"], growthAxis: "소유에서 공유로" },
  { id: 8, weekKey: "taurus-iii", startMonth: 5, startDay: 11, endMonth: 5, endDay: 18, sunSign: "taurus", decanate: 3, isCusp: false, nameKo: "조율의 대지", nameEn: "The Tempered Earth", keywords: ["안정", "미학", "섬세"], growthAxis: "고집에서 유연으로" },
  { id: 9, weekKey: "taurus-gemini-cusp", startMonth: 5, startDay: 19, endMonth: 5, endDay: 24, sunSign: "gemini", decanate: null, isCusp: true, cuspOf: ["taurus", "gemini"], nameKo: "감각의 전언", nameEn: "The Conveyor", keywords: ["표현", "감각", "호기심"], growthAxis: "수동에서 발화로" },
  { id: 10, weekKey: "gemini-i", startMonth: 5, startDay: 25, endMonth: 6, endDay: 2, sunSign: "gemini", decanate: 1, isCusp: false, nameKo: "질문의 호", nameEn: "The Inquirer", keywords: ["언어", "민첩", "분기"], growthAxis: "산만에서 집중으로" },
  { id: 11, weekKey: "gemini-ii", startMonth: 6, startDay: 3, endMonth: 6, endDay: 10, sunSign: "gemini", decanate: 2, isCusp: false, nameKo: "연결의 교환", nameEn: "The Broker", keywords: ["매개", "유연", "지적"], growthAxis: "표면에서 깊이로" },
  { id: 12, weekKey: "gemini-iii", startMonth: 6, startDay: 11, endMonth: 6, endDay: 18, sunSign: "gemini", decanate: 3, isCusp: false, nameKo: "탐색의 교차", nameEn: "The Cross Route", keywords: ["다변", "탐구", "장난"], growthAxis: "헤맴에서 방향으로" },
  { id: 13, weekKey: "gemini-cancer-cusp", startMonth: 6, startDay: 19, endMonth: 6, endDay: 24, sunSign: "cancer", decanate: null, isCusp: true, cuspOf: ["gemini", "cancer"], nameKo: "마음의 기록자", nameEn: "The Chronicler", keywords: ["감수성", "언어", "회상"], growthAxis: "기록에서 창조로" },
  { id: 14, weekKey: "cancer-i", startMonth: 6, startDay: 25, endMonth: 7, endDay: 2, sunSign: "cancer", decanate: 1, isCusp: false, nameKo: "품는 손", nameEn: "The Haven", keywords: ["보살핌", "기억", "공감"], growthAxis: "끌어안음에서 내어줌으로" },
  { id: 15, weekKey: "cancer-ii", startMonth: 7, startDay: 3, endMonth: 7, endDay: 10, sunSign: "cancer", decanate: 2, isCusp: false, nameKo: "둥지의 결", nameEn: "The Dwelling", keywords: ["소속", "정서", "유대"], growthAxis: "의존에서 자립으로" },
  { id: 16, weekKey: "cancer-iii", startMonth: 7, startDay: 11, endMonth: 7, endDay: 18, sunSign: "cancer", decanate: 3, isCusp: false, nameKo: "조용한 방호", nameEn: "The Quiet Guard", keywords: ["방어", "헌신", "깊이"], growthAxis: "움츠림에서 지탱으로" },
  { id: 17, weekKey: "cancer-leo-cusp", startMonth: 7, startDay: 19, endMonth: 7, endDay: 25, sunSign: "leo", decanate: null, isCusp: true, cuspOf: ["cancer", "leo"], nameKo: "진동하는 중심", nameEn: "The Resonance", keywords: ["감정과열", "영향", "매력"], growthAxis: "감정에서 표현으로" },
  { id: 18, weekKey: "leo-i", startMonth: 7, startDay: 26, endMonth: 8, endDay: 2, sunSign: "leo", decanate: 1, isCusp: false, nameKo: "빛의 주장", nameEn: "The Declaration", keywords: ["자기표현", "확신", "체온"], growthAxis: "드러냄에서 나눔으로" },
  { id: 19, weekKey: "leo-ii", startMonth: 8, startDay: 3, endMonth: 8, endDay: 10, sunSign: "leo", decanate: 2, isCusp: false, nameKo: "무대의 축", nameEn: "The Axis of Stage", keywords: ["카리스마", "창조", "관대"], growthAxis: "인정욕구에서 기여로" },
  { id: 20, weekKey: "leo-iii", startMonth: 8, startDay: 11, endMonth: 8, endDay: 18, sunSign: "leo", decanate: 3, isCusp: false, nameKo: "주권의 정원", nameEn: "The Sovereign Garden", keywords: ["위엄", "책임", "관용"], growthAxis: "군림에서 호혜로" },
  { id: 21, weekKey: "leo-virgo-cusp", startMonth: 8, startDay: 19, endMonth: 8, endDay: 25, sunSign: "virgo", decanate: null, isCusp: true, cuspOf: ["leo", "virgo"], nameKo: "노출과 검토", nameEn: "The Exhibit", keywords: ["장인정신", "자기검증", "스타일"], growthAxis: "완벽주의에서 완결로" },
  { id: 22, weekKey: "virgo-i", startMonth: 8, startDay: 26, endMonth: 9, endDay: 2, sunSign: "virgo", decanate: 1, isCusp: false, nameKo: "정교의 작업", nameEn: "The Fine Work", keywords: ["정확", "분석", "책임"], growthAxis: "자기비판에서 기예로" },
  { id: 23, weekKey: "virgo-ii", startMonth: 9, startDay: 3, endMonth: 9, endDay: 10, sunSign: "virgo", decanate: 2, isCusp: false, nameKo: "비밀의 정리자", nameEn: "The Curator", keywords: ["질서", "묵묵", "관찰"], growthAxis: "관찰에서 처방으로" },
  { id: 24, weekKey: "virgo-iii", startMonth: 9, startDay: 11, endMonth: 9, endDay: 18, sunSign: "virgo", decanate: 3, isCusp: false, nameKo: "견고한 숙련", nameEn: "The Craftkeep", keywords: ["장인", "인내", "집중"], growthAxis: "반복에서 숙달로" },
  { id: 25, weekKey: "virgo-libra-cusp", startMonth: 9, startDay: 19, endMonth: 9, endDay: 25, sunSign: "libra", decanate: null, isCusp: true, cuspOf: ["virgo", "libra"], nameKo: "섬세한 저울", nameEn: "The Fine Scale", keywords: ["비평", "품격", "균형"], growthAxis: "판단에서 조정으로" },
  { id: 26, weekKey: "libra-i", startMonth: 9, startDay: 26, endMonth: 10, endDay: 2, sunSign: "libra", decanate: 1, isCusp: false, nameKo: "조화의 촉", nameEn: "The Tuner", keywords: ["미학", "공정", "외교"], growthAxis: "동의에서 결단으로" },
  { id: 27, weekKey: "libra-ii", startMonth: 10, startDay: 3, endMonth: 10, endDay: 10, sunSign: "libra", decanate: 2, isCusp: false, nameKo: "사회의 회전축", nameEn: "The Social Pivot", keywords: ["관계", "지성", "대화"], growthAxis: "중립에서 입장으로" },
  { id: 28, weekKey: "libra-iii", startMonth: 10, startDay: 11, endMonth: 10, endDay: 18, sunSign: "libra", decanate: 3, isCusp: false, nameKo: "극(極)의 균형", nameEn: "The Counterweight", keywords: ["극과 극", "균형", "극적"], growthAxis: "동요에서 평형으로" },
  { id: 29, weekKey: "libra-scorpio-cusp", startMonth: 10, startDay: 19, endMonth: 10, endDay: 25, sunSign: "scorpio", decanate: null, isCusp: true, cuspOf: ["libra", "scorpio"], nameKo: "드라마의 경계", nameEn: "The Liminal Drama", keywords: ["강렬", "예민", "전환"], growthAxis: "극단에서 통합으로" },
  { id: 30, weekKey: "scorpio-i", startMonth: 10, startDay: 26, endMonth: 11, endDay: 2, sunSign: "scorpio", decanate: 1, isCusp: false, nameKo: "조용한 깊이", nameEn: "The Silent Deep", keywords: ["통찰", "의지", "신중"], growthAxis: "의심에서 신뢰로" },
  { id: 31, weekKey: "scorpio-ii", startMonth: 11, startDay: 3, endMonth: 11, endDay: 11, sunSign: "scorpio", decanate: 2, isCusp: false, nameKo: "응축된 의도", nameEn: "The Condensed", keywords: ["집념", "응시", "변혁"], growthAxis: "집착에서 방출로" },
  { id: 32, weekKey: "scorpio-iii", startMonth: 11, startDay: 12, endMonth: 11, endDay: 18, sunSign: "scorpio", decanate: 3, isCusp: false, nameKo: "장엄한 탐사", nameEn: "The Sounding", keywords: ["탐구", "신비", "재생"], growthAxis: "파괴에서 재건으로" },
  { id: 33, weekKey: "scorpio-sagittarius-cusp", startMonth: 11, startDay: 19, endMonth: 11, endDay: 24, sunSign: "sagittarius", decanate: null, isCusp: true, cuspOf: ["scorpio", "sagittarius"], nameKo: "혁명의 사수", nameEn: "The Firebearer", keywords: ["변혁", "폭로", "신념"], growthAxis: "분노에서 비전으로" },
  { id: 34, weekKey: "sagittarius-i", startMonth: 11, startDay: 25, endMonth: 12, endDay: 2, sunSign: "sagittarius", decanate: 1, isCusp: false, nameKo: "활시위의 긴장", nameEn: "The Drawn Bow", keywords: ["자유", "낙관", "직설"], growthAxis: "충동에서 조준으로" },
  { id: 35, weekKey: "sagittarius-ii", startMonth: 12, startDay: 3, endMonth: 12, endDay: 10, sunSign: "sagittarius", decanate: 2, isCusp: false, nameKo: "광대한 궤적", nameEn: "The Wide Arc", keywords: ["이상", "유머", "탐험"], growthAxis: "확장에서 깊이로" },
  { id: 36, weekKey: "sagittarius-iii", startMonth: 12, startDay: 11, endMonth: 12, endDay: 18, sunSign: "sagittarius", decanate: 3, isCusp: false, nameKo: "자유의 지도", nameEn: "The Map of Freedom", keywords: ["독립", "진리", "유목"], growthAxis: "방랑에서 길잡이로" },
  { id: 37, weekKey: "sagittarius-capricorn-cusp", startMonth: 12, startDay: 19, endMonth: 12, endDay: 25, sunSign: "capricorn", decanate: null, isCusp: true, cuspOf: ["sagittarius", "capricorn"], nameKo: "예언의 석비", nameEn: "The Oracle Stone", keywords: ["선지자", "야망", "권위"], growthAxis: "이상에서 제도로" },
  { id: 38, weekKey: "capricorn-i", startMonth: 12, startDay: 26, endMonth: 1, endDay: 2, sunSign: "capricorn", decanate: 1, isCusp: false, nameKo: "결심의 초석", nameEn: "The Cornerstone", keywords: ["근면", "현실", "지구력"], growthAxis: "의무에서 헌신으로" },
  { id: 39, weekKey: "capricorn-ii", startMonth: 1, startDay: 3, endMonth: 1, endDay: 9, sunSign: "capricorn", decanate: 2, isCusp: false, nameKo: "오르는 길", nameEn: "The Ascender", keywords: ["성취", "전략", "절제"], growthAxis: "성취에서 연결로" },
  { id: 40, weekKey: "capricorn-iii", startMonth: 1, startDay: 10, endMonth: 1, endDay: 16, sunSign: "capricorn", decanate: 3, isCusp: false, nameKo: "조용한 권위", nameEn: "The Quiet Authority", keywords: ["신중", "권위", "보존"], growthAxis: "방어에서 개방으로" },
  { id: 41, weekKey: "capricorn-aquarius-cusp", startMonth: 1, startDay: 17, endMonth: 1, endDay: 22, sunSign: "aquarius", decanate: null, isCusp: true, cuspOf: ["capricorn", "aquarius"], nameKo: "신비의 창문", nameEn: "The Aperture", keywords: ["통합", "독창", "사색"], growthAxis: "경직에서 혁신으로" },
  { id: 42, weekKey: "aquarius-i", startMonth: 1, startDay: 23, endMonth: 1, endDay: 30, sunSign: "aquarius", decanate: 1, isCusp: false, nameKo: "새 문법의 결심", nameEn: "The New Syntax", keywords: ["혁신", "자유", "이상"], growthAxis: "괴리에서 공감으로" },
  { id: 43, weekKey: "aquarius-ii", startMonth: 1, startDay: 31, endMonth: 2, endDay: 7, sunSign: "aquarius", decanate: 2, isCusp: false, nameKo: "젊은 발명", nameEn: "The Young Invention", keywords: ["창의", "개방", "저항"], growthAxis: "반항에서 설계로" },
  { id: 44, weekKey: "aquarius-iii", startMonth: 2, startDay: 8, endMonth: 2, endDay: 15, sunSign: "aquarius", decanate: 3, isCusp: false, nameKo: "수용의 넓이", nameEn: "The Wide Receipt", keywords: ["인류애", "실험", "유머"], growthAxis: "거리감에서 공명으로" },
  { id: 45, weekKey: "aquarius-pisces-cusp", startMonth: 2, startDay: 16, endMonth: 2, endDay: 22, sunSign: "pisces", decanate: null, isCusp: true, cuspOf: ["aquarius", "pisces"], nameKo: "감응의 다리", nameEn: "The Sensitive Bridge", keywords: ["감수성", "상상", "이상주의"], growthAxis: "분리에서 결합으로" },
  { id: 46, weekKey: "pisces-i", startMonth: 2, startDay: 23, endMonth: 3, endDay: 2, sunSign: "pisces", decanate: 1, isCusp: false, nameKo: "흐름의 귀", nameEn: "The Listening Current", keywords: ["공감", "직관", "예민"], growthAxis: "용해에서 경계로" },
  { id: 47, weekKey: "pisces-ii", startMonth: 3, startDay: 3, endMonth: 3, endDay: 10, sunSign: "pisces", decanate: 2, isCusp: false, nameKo: "은밀한 상상", nameEn: "The Hidden Stream", keywords: ["몽상", "예술", "헌신"], growthAxis: "도피에서 창조로" },
  { id: 48, weekKey: "pisces-iii", startMonth: 3, startDay: 11, endMonth: 3, endDay: 18, sunSign: "pisces", decanate: 3, isCusp: false, nameKo: "깊은 포용", nameEn: "The Deep Embrace", keywords: ["자비", "헌신", "희생"], growthAxis: "구원욕구에서 경계설정으로" },
];

/**
 * Returns the week containing the given (month, day). Handles the year-crossing
 * week (Dec 26 – Jan 2) naturally.
 */
export function findWeek(month: number, day: number): WeekDefinition {
  for (const w of WEEKS) {
    const crossesYear =
      w.startMonth > w.endMonth ||
      (w.startMonth === w.endMonth && w.startDay > w.endDay);
    if (crossesYear) {
      // e.g. 12-26 ~ 01-02
      if (
        (month > w.startMonth || (month === w.startMonth && day >= w.startDay)) ||
        (month < w.endMonth || (month === w.endMonth && day <= w.endDay))
      ) {
        return w;
      }
    } else {
      if (
        (month > w.startMonth || (month === w.startMonth && day >= w.startDay)) &&
        (month < w.endMonth || (month === w.endMonth && day <= w.endDay))
      ) {
        return w;
      }
    }
  }
  throw new Error(`No week matches ${String(month)}-${String(day)}`);
}
