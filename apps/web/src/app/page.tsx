import { compute } from "@bonyeon/engine-manseryeok";

export default function HomePage() {
  // 데모용 샘플 입력: 1990-12-09 13:00 KST, 서울
  const demo = compute({
    date: { year: 1990, month: 12, day: 9 },
    time: { hour: 13, minute: 0 },
    calendarType: "solar",
    location: { longitude: 126.978, latitude: 37.5665, cityName: "서울" },
    conventions: { jasi: "unified", yearBoundary: "ipchun", useTrueSolarTime: false },
  });

  const pillar = (p: typeof demo.pillars.year) =>
    `${p.stem.han}${p.branch.han} (${p.stem.kr}${p.branch.kr})`;

  const engines = [
    { key: "사주", desc: "천간·지지 네 기둥으로 본 원국", status: "v0.1 구현 완료" },
    { key: "자미두수", desc: "12궁 14주성 명반", status: "스펙 완료 · 구현 예정" },
    { key: "48주 원형", desc: "황도를 48로 나눈 생일 원형", status: "스펙 완료 · 구현 예정" },
    { key: "성향 4축", desc: "에너지·인식·판단·생활양식 자가 진단", status: "스펙 완료 · 구현 예정" },
    { key: "내면 동기", desc: "9유형 원형 + 윙", status: "스펙 완료 · 구현 예정" },
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      {/* Header */}
      <header className="mb-16">
        <p className="mb-3 text-sm uppercase tracking-widest text-neutral-500">
          BONYEON · 본연(本然)
        </p>
        <h1
          className="mb-6 text-5xl leading-tight font-normal tracking-tight md:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          다섯 체계로 비추는
          <br />
          <em className="not-italic text-accent-500">본연</em>.
        </h1>
        <p className="max-w-xl text-lg text-neutral-700">
          사주·자미두수·48주 원형·성향·내면 동기. 서로 다른 다섯 관점이 한 사람을
          어떻게 겹쳐 설명하는지 읽습니다. 운세가 아니라 자기 이해.
        </p>
      </header>

      {/* Engine list */}
      <section className="mb-16">
        <h2 className="mb-6 text-xs uppercase tracking-widest text-neutral-500">
          다섯 원리
        </h2>
        <div className="border-t border-neutral-200">
          {engines.map((e) => (
            <div
              key={e.key}
              className="flex flex-col gap-1 border-b border-neutral-200 py-4 md:flex-row md:items-baseline md:justify-between"
            >
              <div className="flex items-baseline gap-4">
                <span
                  className="text-lg font-medium"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {e.key}
                </span>
                <span className="text-sm text-neutral-500">{e.desc}</span>
              </div>
              <span className="text-xs uppercase tracking-wider text-accent-700">
                {e.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Live demo */}
      <section className="mb-16">
        <h2 className="mb-2 text-xs uppercase tracking-widest text-neutral-500">
          Live demo — 만세력 엔진 v0.1
        </h2>
        <p className="mb-6 text-sm text-neutral-500">
          입력: 1990-12-09 13:00 KST (서울). 서버 컴포넌트에서 엔진이 직접 실행됩니다.
        </p>

        <div
          className="rounded-sm border border-neutral-200 bg-neutral-25 p-6 shadow-sm"
          style={{ backgroundColor: "var(--color-neutral-25)" }}
        >
          <div className="mb-4 grid grid-cols-4 gap-4 border-b border-neutral-200 pb-4">
            {(["year", "month", "day", "hour"] as const).map((k) => {
              const p = demo.pillars[k];
              const label = { year: "연주", month: "월주", day: "일주", hour: "시주" }[k];
              return (
                <div key={k}>
                  <div className="mb-1 text-xs text-neutral-500">{label}</div>
                  <div
                    className="text-2xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {p ? pillar(p) : "—"}
                  </div>
                </div>
              );
            })}
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex justify-between border-b border-neutral-100 py-1">
              <dt className="text-neutral-500">납음(일주)</dt>
              <dd>{demo.napeum.day}</dd>
            </div>
            <div className="flex justify-between border-b border-neutral-100 py-1">
              <dt className="text-neutral-500">공망(일주 기준)</dt>
              <dd>
                {demo.kongmang.byDay[0].han}·{demo.kongmang.byDay[1].han}
              </dd>
            </div>
            <div className="flex justify-between border-b border-neutral-100 py-1">
              <dt className="text-neutral-500">직전 절기</dt>
              <dd>{demo.trace.solarTerms.previousMajor.name}</dd>
            </div>
            <div className="flex justify-between border-b border-neutral-100 py-1">
              <dt className="text-neutral-500">태양 황경</dt>
              <dd>{demo.trace.solarTerms.solarLongitudeAtBirth.toFixed(3)}°</dd>
            </div>
          </dl>

          {demo.trace.warnings.length > 0 && (
            <div className="mt-4 rounded-sm bg-neutral-100 p-3 text-xs text-neutral-700">
              <div className="mb-1 font-medium">v0.1 제약:</div>
              <ul className="ml-4 list-disc space-y-0.5">
                {demo.trace.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 pt-6 text-xs text-neutral-500">
        <p className="mb-1">© 2026 BONYEON. 1인 풀스택 개발 · 베타 예정: 2026-07</p>
        <p>
          <a
            className="text-accent-700 underline underline-offset-2 hover:text-accent-900"
            href="https://github.com/exsucut/BONYEON"
          >
            github.com/exsucut/BONYEON
          </a>
        </p>
      </footer>
    </main>
  );
}
