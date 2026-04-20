import { compute } from "@bonyeon/engine-manseryeok";

export default function HomePage() {
  const demo = compute({
    date: { year: 1990, month: 12, day: 9 },
    time: { hour: 13, minute: 0 },
    calendarType: "solar",
    location: { longitude: 126.978, latitude: 37.5665, cityName: "서울" },
    conventions: { jasi: "unified", yearBoundary: "ipchun", useTrueSolarTime: false },
  });

  const engines = [
    {
      kr: "사주",
      han: "四柱",
      en: "Four Pillars",
      desc: "천간·지지로 읽는 원국(原局). 운명론의 동양적 근원.",
      status: "v0.1 구현 완료",
      built: true,
    },
    {
      kr: "자미두수",
      han: "紫微斗數",
      en: "Zi Wei Dou Shu",
      desc: "12궁에 14주성을 배치해 삶의 영역별 경향을 읽습니다.",
      status: "구현 예정 · P2 W3",
      built: false,
    },
    {
      kr: "48주 원형",
      han: "—",
      en: "Solar Archetypes",
      desc: "태양 황경을 48주로 나눈 서양 원형 체계.",
      status: "구현 예정 · P2 W4",
      built: false,
    },
    {
      kr: "4축 성향",
      han: "—",
      en: "Four-Axis Persona",
      desc: "에너지·인식·판단·생활양식. 공식 MBTI와 별개 자체 문항.",
      status: "구현 예정 · P2 W4",
      built: false,
    },
    {
      kr: "내면 동기",
      han: "—",
      en: "Enneagram",
      desc: "9유형과 윙, 본능·감정·사고 트라이어드.",
      status: "구현 예정 · P2 W5",
      built: false,
    },
  ];

  const pillarLabels = {
    year: { kr: "연주", han: "年" },
    month: { kr: "월주", han: "月" },
    day: { kr: "일주", han: "日" },
    hour: { kr: "시주", han: "時" },
  } as const;

  const serifStack = `"Apple SD Gothic Neo", "Noto Serif KR", "Nanum Myeongjo", "Yu Mincho", "Songti SC", serif`;

  return (
    <div className="min-h-screen antialiased">
      {/* ── Fixed top nav ───────────────────────────────────── */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-neutral-200/60 bg-[--color-neutral-50]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-baseline gap-2 text-sm">
            <span className="font-medium tracking-tight" style={{ fontFamily: serifStack }}>
              本然
            </span>
            <span className="text-neutral-400">·</span>
            <span className="font-mono text-xs tracking-wider text-neutral-500">BONYEON</span>
          </div>
          <a
            href="https://github.com/exsucut/BONYEON"
            className="text-xs uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-[--color-accent-700]"
          >
            Source ↗
          </a>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden px-6 pb-28 pt-36 md:px-10 md:pt-48 md:pb-40">
        {/* 本 ornament */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[2vw] top-6 select-none text-[40vw] leading-none text-[--color-neutral-100] md:top-4 md:text-[32rem]"
          style={{ fontFamily: serifStack, fontWeight: 300 }}
        >
          本
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-10 flex items-center gap-4 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
            <span className="font-mono">001</span>
            <span className="h-px flex-none w-12 bg-neutral-300" />
            <span>Origin Document · 2026</span>
          </div>

          <h1
            className="mb-10 max-w-4xl text-4xl font-normal leading-[1.05] tracking-tight md:text-7xl lg:text-[5.5rem]"
            style={{ fontFamily: serifStack }}
          >
            다섯 관점으로,
            <br />한 사람을 겹쳐 읽는 법.
          </h1>

          <p className="mb-12 max-w-xl text-lg leading-relaxed text-neutral-700 md:text-xl">
            사주·자미두수·48주·성향·내면 동기. 각자의 언어를 섞지 않고 나란히 놓습니다.
            운세가 아닌 자기 이해.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
            <span className="flex items-center gap-2">
              <span className="inline-block size-1.5 rounded-full bg-[--color-accent-500]" />
              Closed beta · July 2026
            </span>
            <span className="hidden h-4 w-px bg-neutral-300 md:inline-block" />
            <span className="font-mono tracking-wider">v0.1.0</span>
          </div>
        </div>
      </section>

      {/* ── Manifesto ──────────────────────────────────────── */}
      <section className="border-t border-neutral-200 px-6 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-8 py-16 md:grid-cols-12 md:py-24">
          <h2 className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 md:col-span-3">
            § Manifesto
          </h2>
          <div className="space-y-6 text-lg leading-relaxed text-neutral-700 md:col-span-8 md:text-xl">
            <p>
              <span
                className="float-left mr-2 text-5xl leading-none text-[--color-accent-500] md:text-6xl"
                style={{ fontFamily: serifStack }}
              >
                본
              </span>
              연(本然)은 "본디 그러한 것" 그대로를 말합니다. 사람이 태어날 때 받은 구도,
              그 위에 자라난 성향의 결. 우리는 그것을 다섯 개의 언어로 읽습니다.
            </p>
            <p>
              사주와 자미두수는 시간의 좌표를 돌려 사람을 배치합니다. 서양의 세 체계는
              내면의 축으로 사람을 기술합니다. 어느 하나가 최종 해석이 아니므로, 우리는
              단정하지 않습니다.
            </p>
            <p className="text-neutral-500">
              결과는 조언도, 예언도 아닙니다. 다섯 거울이 동시에 비추는 한 사람의 그림자,
              그 이상도 이하도.
            </p>
          </div>
        </div>
      </section>

      {/* ── Systems ────────────────────────────────────────── */}
      <section className="border-t border-neutral-200 px-6 md:px-10">
        <div className="mx-auto max-w-6xl py-16 md:py-24">
          <div className="mb-10 grid gap-8 md:grid-cols-12">
            <h2 className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 md:col-span-3">
              § The Five Systems
            </h2>
            <p className="text-neutral-600 md:col-span-8">
              다섯은 병렬이며 교환되지 않습니다. 동양은 동양끼리, 서양은 서양끼리. 교차
              인사이트는 따로 마련된 섹션에서만 이루어집니다.
            </p>
          </div>

          <ol>
            {engines.map((e, i) => (
              <li
                key={e.kr}
                className="grid grid-cols-12 gap-4 border-t border-neutral-200 py-8 md:py-10"
              >
                <span className="col-span-2 pt-1 font-mono text-xs tabular-nums text-neutral-400 md:col-span-1">
                  0{i + 1}
                </span>
                <div className="col-span-10 md:col-span-6">
                  <h3
                    className="mb-1 text-3xl leading-tight tracking-tight md:text-4xl"
                    style={{ fontFamily: serifStack }}
                  >
                    {e.kr}
                    {e.han !== "—" && (
                      <span className="ml-3 text-xl text-neutral-400 md:text-2xl">{e.han}</span>
                    )}
                  </h3>
                  <p className="mt-2 max-w-lg text-neutral-600">{e.desc}</p>
                </div>
                <div className="col-span-12 flex md:col-span-5 md:justify-end md:self-end">
                  <span
                    className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] ${
                      e.built ? "text-[--color-accent-700]" : "text-neutral-400"
                    }`}
                  >
                    <span
                      className={`inline-block size-1.5 rounded-full ${
                        e.built ? "bg-[--color-accent-500]" : "bg-neutral-300"
                      }`}
                    />
                    {e.status}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Live demo ──────────────────────────────────────── */}
      <section className="border-t border-neutral-300 bg-[--color-neutral-25] px-6 md:px-10">
        <div className="mx-auto max-w-6xl py-20 md:py-32">
          <div className="mb-14 grid gap-8 md:grid-cols-12">
            <h2 className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 md:col-span-3">
              § Live Reading
            </h2>
            <div className="md:col-span-8">
              <p className="text-neutral-700">
                아래 네 기둥은 <span className="text-[--color-accent-700]">서버에서 실시간 계산</span>됩니다.
                만세력 엔진 v0.1.0 · Meeus 천문 알고리즘 기반.
              </p>
              <p className="mt-3 font-mono text-xs uppercase tracking-wider text-neutral-500">
                INPUT · 1990-12-09 13:00 KST · 서울 37.57°N 126.98°E
              </p>
            </div>
          </div>

          {/* 4 pillars big hanja */}
          <div className="grid grid-cols-4 gap-px overflow-hidden rounded-sm border border-neutral-300 bg-neutral-300">
            {(["year", "month", "day", "hour"] as const).map((k) => {
              const p = demo.pillars[k];
              const lbl = pillarLabels[k];
              return (
                <div
                  key={k}
                  className="flex min-h-[14rem] flex-col items-center justify-between gap-4 bg-[--color-neutral-25] px-2 py-8 md:min-h-[18rem] md:py-12"
                >
                  <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    {lbl.kr} · {lbl.han}
                  </div>
                  {p ? (
                    <>
                      <div
                        className="text-5xl leading-none md:text-[6.5rem]"
                        style={{ fontFamily: serifStack, letterSpacing: "-0.02em" }}
                      >
                        {p.stem.han}
                        {p.branch.han}
                      </div>
                      <div className="font-mono text-[10px] tracking-wider text-neutral-500">
                        {p.stem.kr}
                        {p.branch.kr}
                      </div>
                    </>
                  ) : (
                    <div className="text-4xl text-neutral-300">—</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Metadata table */}
          <dl className="mt-10 grid grid-cols-1 gap-x-10 md:grid-cols-2">
            {[
              ["납음 (일주)", demo.napeum.day],
              [
                "공망 (일주 기준)",
                `${demo.kongmang.byDay[0].han}·${demo.kongmang.byDay[1].han} (${demo.kongmang.byDay[0].kr}·${demo.kongmang.byDay[1].kr})`,
              ],
              ["직전 절기", demo.trace.solarTerms.previousMajor.name],
              [
                "태양 황경",
                `${demo.trace.solarTerms.solarLongitudeAtBirth.toFixed(3)}°`,
              ],
              ["JDN (일주 기준일)", demo.trace.pillarDecisions.day.jdn.toString()],
              [
                "입춘 기준 연도",
                demo.trace.pillarDecisions.year.effectiveYear.toString(),
              ],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-baseline justify-between gap-4 border-b border-neutral-200 py-3"
              >
                <dt className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">{k}</dt>
                <dd
                  className="font-mono text-sm tabular-nums text-neutral-900"
                  style={{ letterSpacing: "0.02em" }}
                >
                  {v}
                </dd>
              </div>
            ))}
          </dl>

          {demo.trace.warnings.length > 0 && (
            <details className="mt-10 border-t border-neutral-200 pt-6">
              <summary className="cursor-pointer text-[11px] uppercase tracking-[0.25em] text-neutral-500 hover:text-[--color-accent-700]">
                v0.1 제약 ({demo.trace.warnings.length})
              </summary>
              <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                {demo.trace.warnings.map((w, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-mono text-neutral-400">0{i + 1}</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-neutral-300 px-6 md:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 py-10 text-xs text-neutral-500 md:grid-cols-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg" style={{ fontFamily: serifStack }}>
              本然
            </span>
            <span className="font-mono tracking-wider">BONYEON</span>
          </div>
          <div className="md:text-center">© 2026 · 1인 풀스택</div>
          <div className="font-mono md:text-right">
            <a
              className="hover:text-[--color-accent-700]"
              href="https://github.com/exsucut/BONYEON"
            >
              github.com/exsucut/BONYEON
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
