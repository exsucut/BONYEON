"use client";

import {
  compute as computeSaju,
  type JasiConvention,
  type ManseryeokOutput,
} from "@bonyeon/engine-manseryeok";
import {
  compute as computeG48,
  type GoldschneiderOutput,
} from "@bonyeon/engine-goldschneider";
import {
  compute as computeMbti,
  INSTRUMENT_VERSION as MBTI_INSTRUMENT_VERSION,
  ITEMS as MBTI_ITEMS,
  AXIS_LABELS as MBTI_AXIS_LABELS,
  type AxisId as MbtiAxisId,
  type LikertValue as MbtiLikertValue,
  type MbtiOutput,
} from "@bonyeon/engine-mbti";
import { useCallback, useMemo, useState } from "react";

// ─────────────────────────────────────────────────────────────

type FormState = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  timeUnknown: boolean;
  gender: "male" | "female";
  calendarType: "solar" | "lunar";
  jasi: JasiConvention;
};

type TabKey = "saju" | "g48" | "ziwei" | "axis" | "ennea" | "cross";

const TABS: ReadonlyArray<{ key: TabKey; kr: string; han: string; built: boolean }> = [
  { key: "saju", kr: "사주", han: "四柱", built: true },
  { key: "g48", kr: "48주 원형", han: "週", built: true },
  { key: "ziwei", kr: "자미두수", han: "紫微", built: false },
  { key: "axis", kr: "4축 성향", han: "軸", built: true },
  { key: "ennea", kr: "내면 동기", han: "九", built: false },
  { key: "cross", kr: "교차 인사이트", han: "×", built: false },
];

const SERIF = `var(--font-display)`;
const MONO = `var(--font-mono)`;

// ─────────────────────────────────────────────────────────────

export default function App() {
  const [form, setForm] = useState<FormState>({
    year: 1990,
    month: 12,
    day: 9,
    hour: 13,
    minute: 0,
    timeUnknown: false,
    gender: "male",
    calendarType: "solar",
    jasi: "unified",
  });

  const [tab, setTab] = useState<TabKey>("saju");
  const [traceOpen, setTraceOpen] = useState(false);

  // MBTI survey state
  const [mbtiAnswers, setMbtiAnswers] = useState<Record<string, MbtiLikertValue>>({});
  const mbti: MbtiOutput | null = useMemo(() => {
    const answered = Object.entries(mbtiAnswers);
    if (answered.length === 0) return null;
    return computeMbti({
      instrumentVersion: MBTI_INSTRUMENT_VERSION,
      answers: answered.map(([id, value]) => ({ questionId: id, value })),
    });
  }, [mbtiAnswers]);

  const setMbtiAnswer = useCallback((id: string, value: MbtiLikertValue) => {
    setMbtiAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);
  const resetMbti = useCallback(() => setMbtiAnswers({}), []);

  const saju: ManseryeokOutput | null = useMemo(() => {
    try {
      return computeSaju({
        date: { year: form.year, month: form.month, day: form.day },
        time: form.timeUnknown ? null : { hour: form.hour, minute: form.minute },
        calendarType: form.calendarType,
        location: { longitude: 126.978, latitude: 37.5665, cityName: "서울" },
        conventions: {
          jasi: form.jasi,
          yearBoundary: "ipchun",
          useTrueSolarTime: false,
        },
      });
    } catch {
      return null;
    }
  }, [form]);

  const g48: GoldschneiderOutput | null = useMemo(() => {
    try {
      return computeG48({
        solarDate: { year: form.year, month: form.month, day: form.day },
      });
    } catch {
      return null;
    }
  }, [form]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative z-10 flex h-screen flex-col">
      <TopBar />

      <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[340px_1fr]">
        <aside className="overflow-y-auto border-b border-neutral-200 bg-[--color-neutral-25]/70 backdrop-blur-sm md:border-b-0 md:border-r">
          <InputPanel form={form} onChange={update} />
        </aside>

        <main className="overflow-y-auto">
          {saju ? (
            <ReportView
              saju={saju}
              g48={g48}
              mbti={mbti}
              mbtiAnswers={mbtiAnswers}
              onMbtiAnswer={setMbtiAnswer}
              onMbtiReset={resetMbti}
              tab={tab}
              onTabChange={setTab}
              traceOpen={traceOpen}
              onTraceToggle={() => setTraceOpen((v) => !v)}
              profileSummary={profileSummary(form)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-500">
              입력을 확인해주세요.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

function TopBar() {
  return (
    <header className="relative z-20 flex h-14 flex-none items-center justify-between border-b border-neutral-200/80 bg-[--color-neutral-25]/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <SealMark />
        <div className="flex items-baseline gap-2">
          <span
            className="text-xl font-medium leading-none tracking-tight"
            style={{ fontFamily: SERIF }}
          >
            本然
          </span>
          <span
            className="text-[10px] uppercase tracking-[0.25em] text-neutral-500"
            style={{ fontFamily: MONO }}
          >
            BONYEON
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-900"
        >
          저장된 프로필
        </button>
        <a
          href="https://github.com/exsucut/BONYEON"
          className="rounded-full bg-neutral-900 px-3 py-1 text-xs text-[--color-neutral-25] transition hover:bg-[--color-accent-700]"
        >
          Source ↗
        </a>
      </div>
    </header>
  );
}

function SealMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 40 40"
      aria-hidden
      className="text-[--color-accent-500]"
    >
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="3"
        fill="currentColor"
        opacity="0.1"
      />
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <text
        x="20"
        y="27"
        textAnchor="middle"
        fontSize="20"
        fill="currentColor"
        style={{ fontFamily: SERIF, fontWeight: 500 }}
      >
        本
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────

function profileSummary(f: FormState): string {
  const genderKr = f.gender === "male" ? "남자" : "여자";
  const calKr = f.calendarType === "solar" ? "양력" : "음력";
  const date = `${f.year}.${pad2(f.month)}.${pad2(f.day)}`;
  const time = f.timeUnknown ? "시간 모름" : `${pad2(f.hour)}:${pad2(f.minute)}`;
  return `${calKr} · ${date} · ${time} · ${genderKr}`;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

// ─────────────────────────────────────────────────────────────

function InputPanel({
  form,
  onChange,
}: {
  form: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div className="space-y-7 px-6 py-7">
      <div>
        <div className="mb-1.5 flex items-baseline gap-2">
          <span
            className="text-[10px] uppercase tracking-[0.25em] text-[--color-accent-700]"
            style={{ fontFamily: MONO }}
          >
            § Input
          </span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>
        <p className="text-xs leading-relaxed text-neutral-500">
          값을 변경하면 리포트가 즉시 재계산됩니다.
        </p>
      </div>

      <Field label="달력">
        <SegControl
          value={form.calendarType}
          options={[
            { value: "solar", label: "양력" },
            { value: "lunar", label: "음력" },
          ]}
          onChange={(v) => onChange("calendarType", v as "solar" | "lunar")}
        />
      </Field>

      <Field label="성별">
        <SegControl
          value={form.gender}
          options={[
            { value: "male", label: "남자" },
            { value: "female", label: "여자" },
          ]}
          onChange={(v) => onChange("gender", v as "male" | "female")}
        />
      </Field>

      <div>
        <FieldLabel>생년월일</FieldLabel>
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2">
          <NumInput
            value={form.year}
            onChange={(v) => onChange("year", v)}
            min={1900}
            max={2100}
            suffix="년"
          />
          <NumInput
            value={form.month}
            onChange={(v) => onChange("month", clamp(v, 1, 12))}
            min={1}
            max={12}
            suffix="월"
          />
          <NumInput
            value={form.day}
            onChange={(v) => onChange("day", clamp(v, 1, 31))}
            min={1}
            max={31}
            suffix="일"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <FieldLabel>출생 시간</FieldLabel>
          <label className="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <input
              type="checkbox"
              checked={form.timeUnknown}
              onChange={(e) => onChange("timeUnknown", e.target.checked)}
              className="accent-[--color-accent-500]"
            />
            모름
          </label>
        </div>
        <div className={`grid grid-cols-2 gap-2 transition ${form.timeUnknown ? "opacity-40" : ""}`}>
          <NumInput
            value={form.hour}
            onChange={(v) => onChange("hour", clamp(v, 0, 23))}
            min={0}
            max={23}
            suffix="시"
            disabled={form.timeUnknown}
          />
          <NumInput
            value={form.minute}
            onChange={(v) => onChange("minute", clamp(v, 0, 59))}
            min={0}
            max={59}
            suffix="분"
            disabled={form.timeUnknown}
          />
        </div>
      </div>

      <Field label="자시 관례">
        <select
          value={form.jasi}
          onChange={(e) => onChange("jasi", e.target.value as JasiConvention)}
          className="w-full rounded-md border border-neutral-300 bg-[--color-neutral-25] px-3 py-2 text-sm outline-none transition focus:border-[--color-accent-500] focus:ring-4 focus:ring-[--color-accent-500]/10"
        >
          <option value="unified">통일 자시 (23:00 기준)</option>
          <option value="split">야자시·조자시 분리</option>
          <option value="offset30">30분 오프셋</option>
        </select>
      </Field>

      <div className="rounded-md border border-neutral-200 bg-[--color-neutral-50]/50 p-3 text-[11px] leading-relaxed text-neutral-500">
        <div className="mb-0.5">
          <span className="text-neutral-400">출생지</span>{" "}
          <span style={{ fontFamily: MONO }}>서울 37.57°N 126.98°E</span>
        </div>
        <div className="mb-0.5">
          <span className="text-neutral-400">시간대</span>{" "}
          <span style={{ fontFamily: MONO }}>KST +09:00 표준시</span>
        </div>
        <div className="text-neutral-400">
          진태양시 보정·서머타임은 v0.2에서 적용됩니다.
        </div>
      </div>
    </div>
  );
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// ─────────────────────────────────────────────────────────────

function ReportView({
  saju,
  g48,
  mbti,
  mbtiAnswers,
  onMbtiAnswer,
  onMbtiReset,
  tab,
  onTabChange,
  traceOpen,
  onTraceToggle,
  profileSummary,
}: {
  saju: ManseryeokOutput;
  g48: GoldschneiderOutput | null;
  mbti: MbtiOutput | null;
  mbtiAnswers: Record<string, MbtiLikertValue>;
  onMbtiAnswer: (id: string, v: MbtiLikertValue) => void;
  onMbtiReset: () => void;
  tab: TabKey;
  onTabChange: (t: TabKey) => void;
  traceOpen: boolean;
  onTraceToggle: () => void;
  profileSummary: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <HeroSummary saju={saju} profileSummary={profileSummary} />

      <TabBar tab={tab} onTabChange={onTabChange} />

      <section className="flex-1 overflow-y-auto">
        {tab === "saju" && <SajuPanel saju={saju} />}
        {tab === "g48" && g48 && <G48Panel g48={g48} />}
        {tab === "axis" && (
          <AxisPanel
            mbti={mbti}
            answers={mbtiAnswers}
            onAnswer={onMbtiAnswer}
            onReset={onMbtiReset}
          />
        )}
        {tab !== "saju" && tab !== "g48" && tab !== "axis" && <NotReadyPanel tab={tab} />}

        <div className="border-t border-neutral-200 bg-[--color-neutral-25]">
          <button
            type="button"
            onClick={onTraceToggle}
            className="flex w-full items-center justify-between px-6 py-3 text-left text-[11px] uppercase tracking-[0.25em] text-neutral-500 transition-colors hover:bg-neutral-100 md:px-10"
            style={{ fontFamily: MONO }}
          >
            <span>
              § Trace · 계산 근거{" "}
              <span className="ml-2 text-neutral-400">
                ({saju.trace.warnings.length} warnings)
              </span>
            </span>
            <span
              className="text-neutral-400 transition-transform"
              style={{ transform: traceOpen ? "rotate(180deg)" : "none" }}
            >
              ▾
            </span>
          </button>
          {traceOpen && <TracePanel saju={saju} />}
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

function HeroSummary({
  saju,
  profileSummary,
}: {
  saju: ManseryeokOutput;
  profileSummary: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-br from-[--color-neutral-25] to-[--color-neutral-50] px-6 py-7 md:px-10 md:py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-16 select-none text-[18rem] leading-none text-[--color-neutral-100]"
        style={{ fontFamily: SERIF, fontWeight: 300 }}
      >
        本
      </div>

      <div className="relative">
        <div
          className="mb-1 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-neutral-500"
          style={{ fontFamily: MONO }}
        >
          <span className="text-[--color-accent-700]">PROFILE</span>
          <div className="h-px flex-1 max-w-[6rem] bg-neutral-200" />
        </div>

        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
          <h1
            className="rise-in text-3xl leading-none tracking-tight md:text-5xl"
            style={{ fontFamily: SERIF, letterSpacing: "-0.02em" }}
          >
            {(["year", "month", "day", "hour"] as const)
              .map((k) => {
                const p = saju.pillars[k];
                return p ? `${p.stem.han}${p.branch.han}` : "—";
              })
              .join(" · ")}
          </h1>
          <span
            className="text-xs text-neutral-500"
            style={{ fontFamily: MONO }}
          >
            {profileSummary}
          </span>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────

function TabBar({
  tab,
  onTabChange,
}: {
  tab: TabKey;
  onTabChange: (t: TabKey) => void;
}) {
  return (
    <nav className="flex-none overflow-x-auto border-b border-neutral-200 bg-[--color-neutral-25]">
      <div className="flex gap-0 whitespace-nowrap px-4 md:px-10">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onTabChange(t.key)}
              className={`group relative flex items-baseline gap-2 px-4 py-3.5 text-sm transition-colors ${
                active ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <span>{t.kr}</span>
              <span
                className="text-[11px] text-neutral-400"
                style={{ fontFamily: SERIF }}
              >
                {t.han}
              </span>
              {!t.built && (
                <span
                  className="ml-1 rounded-full bg-neutral-200 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-neutral-500"
                  style={{ fontFamily: MONO }}
                >
                  soon
                </span>
              )}
              {active && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[--color-accent-500]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// Saju panel

function SajuPanel({ saju }: { saju: ManseryeokOutput }) {
  const pillarLabels = {
    year: { kr: "연주", han: "年" },
    month: { kr: "월주", han: "月" },
    day: { kr: "일주", han: "日" },
    hour: { kr: "시주", han: "時" },
  } as const;

  return (
    <div className="px-6 py-8 md:px-10 md:py-10">
      {/* Four pillars */}
      <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {(["year", "month", "day", "hour"] as const).map((k) => {
          const p = saju.pillars[k];
          const lbl = pillarLabels[k];
          const stems = saju.hiddenStems[k];
          const isEmpty = !p;
          return (
            <div
              key={k}
              className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-[--color-neutral-25] p-5 shadow-[0_1px_0_rgba(58,55,48,0.03)] transition hover:-translate-y-0.5 hover:border-[--color-accent-300] hover:shadow-[0_6px_20px_-8px_rgba(58,55,48,0.15)]"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(196,86,60,0.02) 0%, transparent 40%)",
              }}
            >
              <div className="mb-4 flex items-baseline justify-between">
                <div
                  className="text-[10px] uppercase tracking-[0.25em] text-neutral-500"
                  style={{ fontFamily: MONO }}
                >
                  {lbl.kr}
                </div>
                <div
                  className="text-xl text-[--color-accent-500]/40"
                  style={{ fontFamily: SERIF }}
                >
                  {lbl.han}
                </div>
              </div>

              {isEmpty ? (
                <div className="flex h-28 items-center justify-center text-3xl text-neutral-200">
                  —
                </div>
              ) : (
                <>
                  <div className="mb-1 flex items-end justify-center gap-0">
                    <div
                      className="text-6xl leading-[0.9]"
                      style={{
                        fontFamily: SERIF,
                        letterSpacing: "-0.03em",
                        color: elementColor(p.stem.element),
                      }}
                    >
                      {p.stem.han}
                    </div>
                    <div
                      className="text-6xl leading-[0.9]"
                      style={{
                        fontFamily: SERIF,
                        letterSpacing: "-0.03em",
                        color: elementColor(p.branch.element),
                      }}
                    >
                      {p.branch.han}
                    </div>
                  </div>
                  <div
                    className="mb-4 text-center text-[11px] tracking-wider text-neutral-500"
                    style={{ fontFamily: MONO }}
                  >
                    {p.stem.kr}
                    {p.branch.kr} ·{" "}
                    <span style={{ color: elementColor(p.stem.element) }}>
                      {p.stem.element}
                    </span>
                    <span className="text-neutral-400"> / </span>
                    <span style={{ color: elementColor(p.branch.element) }}>
                      {p.branch.element}
                    </span>
                  </div>
                </>
              )}

              {stems && stems.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1 border-t border-neutral-100 pt-3">
                  {stems.map((hs, i) => (
                    <div
                      key={i}
                      className="flex items-baseline gap-0.5 rounded-full bg-neutral-100 px-2 py-0.5"
                      title={`${labelHiddenType(hs.type)} · ${String(hs.days)}일`}
                    >
                      <span
                        className="text-[13px]"
                        style={{
                          fontFamily: SERIF,
                          color: elementColor(hs.stem.element),
                        }}
                      >
                        {hs.stem.han}
                      </span>
                      <span
                        className="text-[9px] text-neutral-400"
                        style={{ fontFamily: MONO }}
                      >
                        {hs.days}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ohaeng + metadata */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-xl border border-neutral-200 bg-[--color-neutral-25] p-5 shadow-sm">
          <SectionLabel text="§ 오행 분포" sub="4기둥 × 간·지 총 8자 기준" />
          <OhaengDonut saju={saju} />
        </section>

        <section className="rounded-xl border border-neutral-200 bg-[--color-neutral-25] p-5 shadow-sm">
          <SectionLabel text="§ 메타데이터" sub="만세력 엔진 부가 출력" />
          <dl className="space-y-3 text-sm">
            <MetaRow
              label="납음 (일주)"
              value={saju.napeum.day}
              serif
            />
            <MetaRow
              label="공망"
              value={`${saju.kongmang.byDay[0].han}·${saju.kongmang.byDay[1].han}`}
              sub={`${saju.kongmang.byDay[0].kr}·${saju.kongmang.byDay[1].kr}`}
              serif
            />
            <MetaRow
              label="직전 절기"
              value={saju.trace.solarTerms.previousMajor.name}
              sub={formatDate(saju.trace.solarTerms.previousMajor.utc)}
            />
            <MetaRow
              label="다음 절기"
              value={saju.trace.solarTerms.nextMajor.name}
              sub={formatDate(saju.trace.solarTerms.nextMajor.utc)}
            />
            <MetaRow
              label="태양 황경"
              value={`${saju.trace.solarTerms.solarLongitudeAtBirth.toFixed(3)}°`}
              mono
            />
            <MetaRow
              label="JDN (일주 기준일)"
              value={saju.trace.pillarDecisions.day.jdn.toString()}
              sub={`anchor ${saju.trace.pillarDecisions.day.referenceAnchor.pillar}`}
              mono
            />
          </dl>
        </section>
      </div>
    </div>
  );
}

function elementColor(e: string): string {
  switch (e) {
    case "목":
      return "var(--color-oh-wood)";
    case "화":
      return "var(--color-oh-fire)";
    case "토":
      return "var(--color-oh-earth)";
    case "금":
      return "var(--color-neutral-700)"; // tweak for contrast vs oatmeal
    case "수":
      return "var(--color-oh-water)";
    default:
      return "currentColor";
  }
}

function labelHiddenType(t: string): string {
  return t === "early" ? "초기" : t === "middle" ? "중기" : "정기";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─────────────────────────────────────────────────────────────

function OhaengDonut({ saju }: { saju: ManseryeokOutput }) {
  const els = ["목", "화", "토", "금", "수"] as const;
  const tally: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const key of ["year", "month", "day", "hour"] as const) {
    const p = saju.pillars[key];
    if (!p) continue;
    tally[p.stem.element] = (tally[p.stem.element] ?? 0) + 1;
    tally[p.branch.element] = (tally[p.branch.element] ?? 0) + 1;
  }
  const total = Object.values(tally).reduce((a, b) => a + b, 0) || 1;

  // Build SVG donut
  const radius = 56;
  const stroke = 16;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  const segments = els.map((el) => {
    const portion = (tally[el] ?? 0) / total;
    const length = portion * circ;
    const seg = {
      el,
      color: elementColor(el),
      length,
      offset,
      portion,
    };
    offset += length;
    return seg;
  });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <svg width="160" height="160" viewBox="0 0 160 160" className="flex-none">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="var(--color-neutral-100)"
          strokeWidth={stroke}
        />
        {segments.map((s) => (
          <circle
            key={s.el}
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${s.length} ${circ - s.length}`}
            strokeDashoffset={-s.offset}
            transform="rotate(-90 80 80)"
            strokeLinecap="butt"
          />
        ))}
        <text
          x="80"
          y="77"
          textAnchor="middle"
          fontSize="11"
          fill="var(--color-neutral-500)"
          style={{ fontFamily: MONO, letterSpacing: "0.15em" }}
        >
          TOTAL
        </text>
        <text
          x="80"
          y="95"
          textAnchor="middle"
          fontSize="24"
          fill="var(--color-neutral-900)"
          style={{ fontFamily: SERIF, fontWeight: 500 }}
        >
          {total}
        </text>
      </svg>
      <ul className="flex-1 space-y-1.5">
        {els.map((el) => {
          const n = tally[el] ?? 0;
          const pct = Math.round((n / total) * 100);
          return (
            <li key={el} className="flex items-center gap-3 text-sm">
              <span
                className="inline-block size-3 flex-none rounded-sm"
                style={{ backgroundColor: elementColor(el) }}
              />
              <span className="w-4 text-neutral-600" style={{ fontFamily: SERIF }}>
                {el}
              </span>
              <span className="flex-1">
                <span
                  className="block h-1.5 rounded-full bg-neutral-100"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${elementColor(el)} ${pct}%, transparent ${pct}%)`,
                  }}
                />
              </span>
              <span
                className="w-10 text-right tabular-nums text-neutral-500"
                style={{ fontFamily: MONO }}
              >
                {n}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Goldschneider panel

function G48Panel({ g48 }: { g48: GoldschneiderOutput }) {
  const signKo: Record<string, string> = {
    aries: "양자리",
    taurus: "황소자리",
    gemini: "쌍둥이자리",
    cancer: "게자리",
    leo: "사자자리",
    virgo: "처녀자리",
    libra: "천칭자리",
    scorpio: "전갈자리",
    sagittarius: "사수자리",
    capricorn: "염소자리",
    aquarius: "물병자리",
    pisces: "물고기자리",
  };

  return (
    <div className="px-6 py-8 md:px-10 md:py-10">
      {/* Hero card */}
      <section
        className="relative mb-8 overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-[--color-neutral-25] via-[--color-neutral-25] to-[--color-accent-100]/40 p-8 shadow-sm"
      >
        <div className="relative z-10">
          <div
            className="mb-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-[--color-accent-700]"
            style={{ fontFamily: MONO }}
          >
            <span>ARCHETYPE · {String(g48.archetypeId).padStart(2, "0")} / 48</span>
            <div className="h-px flex-1 max-w-[6rem] bg-neutral-200" />
          </div>
          <h2
            className="mb-2 text-4xl leading-tight tracking-tight md:text-5xl"
            style={{ fontFamily: SERIF, letterSpacing: "-0.02em" }}
          >
            {g48.nameKo}
          </h2>
          <div
            className="mb-4 text-base text-neutral-500"
            style={{ fontFamily: SERIF, fontStyle: "italic" }}
          >
            {g48.nameEn}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
            <span
              className="rounded-full border border-neutral-200 bg-[--color-neutral-25] px-3 py-1"
              style={{ fontFamily: MONO }}
            >
              {signKo[g48.sunSign]}
            </span>
            {g48.isCusp ? (
              <span
                className="rounded-full border border-[--color-accent-300] bg-[--color-accent-100]/30 px-3 py-1 text-[--color-accent-700]"
                style={{ fontFamily: MONO }}
              >
                CUSP · 경계일
              </span>
            ) : (
              <span
                className="rounded-full border border-neutral-200 bg-[--color-neutral-25] px-3 py-1"
                style={{ fontFamily: MONO }}
              >
                Decanate {g48.decanate}
              </span>
            )}
          </div>
          {g48.isCusp && g48.cuspDetail && (
            <div className="mt-3 text-xs text-neutral-500">
              {signKo[g48.cuspDetail.previousSign]} → {signKo[g48.cuspDetail.nextSign]}{" "}
              경계. 중심에서 {Math.abs(g48.cuspDetail.daysFromCenter)}일.
            </div>
          )}
        </div>

        {/* Big decorative week number */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-4 -bottom-12 select-none text-[14rem] leading-none text-[--color-accent-500]/10"
          style={{ fontFamily: SERIF, fontWeight: 300 }}
        >
          {String(g48.archetypeId).padStart(2, "0")}
        </div>
      </section>

      {/* Keywords + growth */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <section className="rounded-xl border border-neutral-200 bg-[--color-neutral-25] p-5 shadow-sm">
          <SectionLabel text="§ 핵심 키워드" />
          <div className="flex flex-wrap gap-2">
            {g48.keywords.map((k) => (
              <span
                key={k}
                className="rounded-full border border-neutral-200 bg-[--color-neutral-50] px-3 py-1.5 text-sm text-neutral-700"
              >
                {k}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-[--color-neutral-25] p-5 shadow-sm">
          <SectionLabel text="§ 성장축" sub="당신의 원형이 움직이는 방향" />
          <div
            className="text-xl tracking-tight"
            style={{ fontFamily: SERIF }}
          >
            {g48.growthAxis}
          </div>
        </section>
      </div>

      {/* Week ring */}
      <section className="mt-5 rounded-xl border border-neutral-200 bg-[--color-neutral-25] p-5 shadow-sm">
        <SectionLabel
          text="§ 48주 위치"
          sub={`전체 365일의 주기에서 당신의 위치 (${String(g48.archetypeId).padStart(2, "0")} / 48)`}
        />
        <WeekRing currentId={g48.archetypeId} />
      </section>
    </div>
  );
}

function WeekRing({ currentId }: { currentId: number }) {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 108;
  const rInner = 92;
  const slices = Array.from({ length: 48 }, (_, i) => i + 1);
  const sweep = (2 * Math.PI) / 48;

  return (
    <div className="flex items-center justify-center py-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((id) => {
          const a0 = -Math.PI / 2 + (id - 1) * sweep;
          const a1 = a0 + sweep * 0.9; // small gap
          const x0o = cx + rOuter * Math.cos(a0);
          const y0o = cy + rOuter * Math.sin(a0);
          const x1o = cx + rOuter * Math.cos(a1);
          const y1o = cy + rOuter * Math.sin(a1);
          const x0i = cx + rInner * Math.cos(a0);
          const y0i = cy + rInner * Math.sin(a0);
          const x1i = cx + rInner * Math.cos(a1);
          const y1i = cy + rInner * Math.sin(a1);
          const active = id === currentId;
          const path = `M ${x0o} ${y0o} A ${rOuter} ${rOuter} 0 0 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${rInner} ${rInner} 0 0 0 ${x0i} ${y0i} Z`;
          return (
            <path
              key={id}
              d={path}
              fill={active ? "var(--color-accent-500)" : "var(--color-neutral-200)"}
              opacity={active ? 1 : 0.8}
            />
          );
        })}
        {/* Center text */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize="11"
          fill="var(--color-neutral-500)"
          style={{ fontFamily: MONO, letterSpacing: "0.2em" }}
        >
          WEEK
        </text>
        <text
          x={cx}
          y={cy + 22}
          textAnchor="middle"
          fontSize="36"
          fill="var(--color-neutral-900)"
          style={{ fontFamily: SERIF, fontWeight: 500 }}
        >
          {String(currentId).padStart(2, "0")}
        </text>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// 4축 성향 panel (MBTI 자체 간이 진단)

function AxisPanel({
  mbti,
  answers,
  onAnswer,
  onReset,
}: {
  mbti: MbtiOutput | null;
  answers: Record<string, MbtiLikertValue>;
  onAnswer: (id: string, v: MbtiLikertValue) => void;
  onReset: () => void;
}) {
  const answered = Object.keys(answers).length;
  const total = MBTI_ITEMS.length;
  const complete = answered >= total;

  return (
    <div className="px-6 py-8 md:px-10 md:py-10">
      {/* Progress header */}
      <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-[--color-neutral-25] p-4 shadow-sm">
        <div>
          <div
            className="mb-1 text-[10px] uppercase tracking-[0.25em] text-[--color-accent-700]"
            style={{ fontFamily: MONO }}
          >
            4축 자가 진단 · Quick Screening v0.1
          </div>
          <div className="text-sm text-neutral-600">
            총 {total}문항 · 7점 척도 (1=매우 반대, 7=매우 동의){" "}
            <span className="text-neutral-400">· MBTI® 공식 검사가 아님</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ProgressBar current={answered} total={total} />
          {answered > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-neutral-500 underline underline-offset-2 hover:text-[--color-accent-700]"
            >
              초기화
            </button>
          )}
        </div>
      </section>

      {/* Result at top if complete */}
      {mbti && complete && <MbtiResult mbti={mbti} />}

      {/* Questions */}
      <section className="grid grid-cols-1 gap-3">
        {MBTI_ITEMS.map((item, i) => (
          <QuestionCard
            key={item.id}
            index={i + 1}
            total={total}
            prompt={item.prompt}
            axis={item.axis}
            value={answers[item.id]}
            onChange={(v) => onAnswer(item.id, v)}
          />
        ))}
      </section>
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-neutral-200">
        <div
          className="absolute inset-y-0 left-0 bg-[--color-accent-500] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className="text-xs tabular-nums text-neutral-500"
        style={{ fontFamily: MONO }}
      >
        {current}/{total}
      </span>
    </div>
  );
}

function QuestionCard({
  index,
  total,
  prompt,
  axis,
  value,
  onChange,
}: {
  index: number;
  total: number;
  prompt: string;
  axis: MbtiAxisId;
  value: MbtiLikertValue | undefined;
  onChange: (v: MbtiLikertValue) => void;
}) {
  const axisColor: Record<MbtiAxisId, string> = {
    ei: "var(--color-oh-water)",
    sn: "var(--color-oh-wood)",
    tf: "var(--color-oh-fire)",
    jp: "var(--color-oh-earth)",
  };
  const axisLabel: Record<MbtiAxisId, string> = {
    ei: "E/I",
    sn: "S/N",
    tf: "T/F",
    jp: "J/P",
  };

  return (
    <div
      className="rounded-xl border border-neutral-200 bg-[--color-neutral-25] p-4 shadow-sm transition hover:border-neutral-300"
      style={
        value !== undefined
          ? { borderColor: "var(--color-accent-300)" }
          : undefined
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <div
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500"
          style={{ fontFamily: MONO }}
        >
          <span className="tabular-nums">
            {String(index).padStart(2, "0")}/{String(total).padStart(2, "0")}
          </span>
          <span
            className="rounded-full px-2 py-0.5"
            style={{
              backgroundColor: "var(--color-neutral-100)",
              color: axisColor[axis],
            }}
          >
            {axisLabel[axis]}
          </span>
        </div>
      </div>
      <p className="mb-4 text-base leading-relaxed text-neutral-800">{prompt}</p>
      <LikertScale value={value} onChange={onChange} />
    </div>
  );
}

function LikertScale({
  value,
  onChange,
}: {
  value: MbtiLikertValue | undefined;
  onChange: (v: MbtiLikertValue) => void;
}) {
  const values: MbtiLikertValue[] = [1, 2, 3, 4, 5, 6, 7];
  const sizeMap = [26, 30, 34, 38, 34, 30, 26];
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wider text-neutral-400">
          매우 반대
        </span>
        <div className="flex items-center gap-2">
          {values.map((v, i) => {
            const selected = value === v;
            const sz = sizeMap[i] ?? 28;
            return (
              <button
                key={v}
                type="button"
                onClick={() => onChange(v)}
                aria-label={`점수 ${String(v)}`}
                className={`flex items-center justify-center rounded-full border-2 transition ${
                  selected
                    ? "border-[--color-accent-500] bg-[--color-accent-500]"
                    : "border-neutral-300 bg-[--color-neutral-25] hover:border-[--color-accent-300]"
                }`}
                style={{ width: sz, height: sz }}
              >
                {selected && (
                  <span className="size-2 rounded-full bg-white opacity-90" />
                )}
              </button>
            );
          })}
        </div>
        <span className="text-[10px] uppercase tracking-wider text-neutral-400">
          매우 동의
        </span>
      </div>
    </div>
  );
}

function MbtiResult({ mbti }: { mbti: MbtiOutput }) {
  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-[--color-accent-300]/50 bg-gradient-to-br from-[--color-neutral-25] via-[--color-neutral-25] to-[--color-accent-100]/40 p-6 shadow-sm md:p-8">
      <div
        className="mb-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-[--color-accent-700]"
        style={{ fontFamily: MONO }}
      >
        <span>RESULT · Quick 16</span>
        <div className="h-px flex-1 max-w-[6rem] bg-neutral-200" />
      </div>

      <div className="mb-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <div
          className="text-7xl leading-none tracking-tight"
          style={{ fontFamily: SERIF, letterSpacing: "-0.03em" }}
        >
          {mbti.code}
        </div>
        <div>
          <div
            className="text-2xl leading-tight"
            style={{ fontFamily: SERIF }}
          >
            {mbti.typeName.kr}
          </div>
          <div
            className="text-sm text-neutral-500"
            style={{ fontFamily: SERIF, fontStyle: "italic" }}
          >
            {mbti.typeName.en}
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="mb-5 flex flex-wrap gap-2">
        {mbti.typeName.keywords.map((k) => (
          <span
            key={k}
            className="rounded-full border border-neutral-200 bg-[--color-neutral-25] px-3 py-1 text-sm text-neutral-700"
          >
            {k}
          </span>
        ))}
      </div>

      {mbti.typeName.misconception && (
        <p className="mb-5 rounded-md border-l-2 border-[--color-accent-500] bg-[--color-neutral-25]/60 px-3 py-2 text-sm leading-relaxed text-neutral-700">
          <span
            className="mr-2 text-[10px] uppercase tracking-[0.2em] text-[--color-accent-700]"
            style={{ fontFamily: MONO }}
          >
            NOTE
          </span>
          {mbti.typeName.misconception}
        </p>
      )}

      {/* Axis bars */}
      <div className="grid grid-cols-1 gap-2.5">
        {(["ei", "sn", "tf", "jp"] as const).map((ax) => (
          <AxisBar key={ax} axis={ax} result={mbti.axes[ax]} />
        ))}
      </div>

      {/* Boundary notice */}
      {mbti.boundaryNotices.length > 0 && (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50/50 p-3 text-xs text-neutral-700">
          <div
            className="mb-1 text-[10px] uppercase tracking-[0.2em] text-amber-700"
            style={{ fontFamily: MONO }}
          >
            경계값 안내
          </div>
          <ul className="space-y-1">
            {mbti.boundaryNotices.map((b) => (
              <li key={b.axis}>
                <span className="font-mono">{b.axis.toUpperCase()}</span> 축이
                중심에 가깝습니다. 상황에 따라 <b>{b.alternateCode}</b> 성향도
                함께 나타날 수 있습니다.
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reliability */}
      <div
        className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-neutral-500"
        style={{ fontFamily: MONO }}
      >
        <span>
          consistency {Math.round(mbti.reliability.consistency * 100)}%
        </span>
        <span>
          decisiveness {Math.round(mbti.reliability.decisiveness * 100)}%
        </span>
        {mbti.reliability.flags.map((f) => (
          <span
            key={f}
            className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700"
          >
            {f}
          </span>
        ))}
      </div>
    </section>
  );
}

function AxisBar({
  axis,
  result,
}: {
  axis: MbtiAxisId;
  result: MbtiOutput["axes"]["ei"];
}) {
  const labels = MBTI_AXIS_LABELS[axis];
  const poles: Record<MbtiAxisId, [string, string]> = {
    ei: ["I", "E"],
    sn: ["S", "N"],
    tf: ["T", "F"],
    jp: ["J", "P"],
  };
  const [negPole, posPole] = poles[axis];
  const pct = (result.normalized + 100) / 2; // 0..100 where 50 is center
  const active = result.pole;
  const activeIsPos = active === posPole;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-[11px]">
        <span
          className={`flex items-baseline gap-1 ${activeIsPos ? "text-neutral-400" : "text-neutral-900"}`}
        >
          <span className="font-mono text-[10px]">{negPole}</span>
          <span className="text-neutral-500">{labels.negative}</span>
        </span>
        <span
          className={`flex items-baseline gap-1 ${activeIsPos ? "text-neutral-900" : "text-neutral-400"}`}
        >
          <span className="text-neutral-500">{labels.positive}</span>
          <span className="font-mono text-[10px]">{posPole}</span>
        </span>
      </div>
      <div className="relative h-6 overflow-hidden rounded-md bg-neutral-100">
        {/* Center tick */}
        <div className="absolute inset-y-0 left-1/2 w-px bg-neutral-300" />
        {/* Fill */}
        <div
          className="absolute inset-y-0 bg-[--color-accent-500]/80 transition-all"
          style={{
            left: activeIsPos ? "50%" : `${pct}%`,
            width: activeIsPos ? `${pct - 50}%` : `${50 - pct}%`,
          }}
        />
        {/* Marker */}
        <div
          className="absolute top-1/2 h-4 w-[3px] -translate-y-1/2 -translate-x-1/2 rounded-sm bg-[--color-accent-700]"
          style={{ left: `${pct}%` }}
        />
        {/* Label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-[10px] tabular-nums text-neutral-600"
            style={{ fontFamily: MONO }}
          >
            {result.normalized >= 0 ? "+" : ""}
            {result.normalized.toFixed(0)} · {result.confidence}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

function NotReadyPanel({ tab }: { tab: TabKey }) {
  const info = TABS.find((t) => t.key === tab);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-8 py-24 text-center">
      <div className="relative">
        <div
          className="text-[10rem] leading-none text-[--color-neutral-100]"
          style={{ fontFamily: SERIF }}
        >
          {info?.han}
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center text-[10rem] leading-none text-[--color-accent-500]/10"
          style={{ fontFamily: SERIF }}
        >
          {info?.han}
        </div>
      </div>
      <h2 className="text-2xl tracking-tight" style={{ fontFamily: SERIF }}>
        {info?.kr}
      </h2>
      <p className="max-w-sm text-sm leading-relaxed text-neutral-500">
        이 엔진은 아직 구현되지 않았습니다. 명세는 완료 상태이며,
        로드맵(P2)에 따라 순차 구현됩니다.
      </p>
      <a
        href={`https://github.com/exsucut/BONYEON/tree/main/docs`}
        className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-[--color-neutral-25] px-4 py-2 text-xs uppercase tracking-[0.2em] text-neutral-700 transition hover:border-[--color-accent-300] hover:text-[--color-accent-700]"
        style={{ fontFamily: MONO }}
      >
        명세 보기 ↗
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

function TracePanel({ saju }: { saju: ManseryeokOutput }) {
  const t = saju.trace;
  return (
    <div className="bg-[--color-neutral-25] px-6 py-5 text-xs md:px-10" style={{ fontFamily: MONO }}>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <TraceRow label="입춘 UTC" value={t.pillarDecisions.year.ipchunUtc} />
        <TraceRow
          label="출생 vs 입춘"
          value={t.pillarDecisions.year.birthRelativeToIpchun}
        />
        <TraceRow
          label="effective year"
          value={t.pillarDecisions.year.effectiveYear.toString()}
        />
        <TraceRow
          label="지배 절기"
          value={t.pillarDecisions.month.governingTermName}
        />
        <TraceRow label="오호둔" value={t.pillarDecisions.month.wuhutunRule} />
        <TraceRow label="일주 JDN" value={t.pillarDecisions.day.jdn.toString()} />
        <TraceRow
          label="자시 조정"
          value={t.pillarDecisions.day.jasiAdjustment}
        />
        {t.pillarDecisions.hour && (
          <TraceRow label="오서둔" value={t.pillarDecisions.hour.wusodunRule} />
        )}
        <TraceRow
          label="태양 황경"
          value={`${t.solarTerms.solarLongitudeAtBirth.toFixed(5)}°`}
        />
        <TraceRow label="천문 데이터" value={t.solarTerms.dataSource} />
      </div>

      {t.warnings.length > 0 && (
        <div className="mt-5 border-t border-neutral-200 pt-4">
          <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-[--color-accent-700]">
            Warnings · {t.warnings.length}
          </div>
          <ul className="space-y-1.5 font-sans text-xs text-neutral-600">
            {t.warnings.map((w, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-neutral-400" style={{ fontFamily: MONO }}>
                  {pad2(i + 1)}
                </span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TraceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] items-baseline gap-3 border-b border-neutral-100 py-1.5">
      <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </span>
      <span className="break-all text-neutral-900">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Primitives

function SectionLabel({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="mb-4">
      <div
        className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-neutral-500"
        style={{ fontFamily: MONO }}
      >
        <span>{text}</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>
      {sub && <div className="mt-1 text-xs text-neutral-500">{sub}</div>}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-neutral-500"
      style={{ fontFamily: MONO }}
    >
      {children}
    </label>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function SegControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div
      className="grid gap-1 rounded-md border border-neutral-300 bg-[--color-neutral-25] p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`relative rounded-[5px] py-1.5 text-sm transition-all ${
              active
                ? "bg-neutral-900 text-[--color-neutral-25] shadow-sm"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function NumInput({
  value,
  onChange,
  min,
  max,
  suffix,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="w-full rounded-md border border-neutral-300 bg-[--color-neutral-25] px-3 py-2 pr-7 text-sm tabular-nums outline-none transition focus:border-[--color-accent-500] focus:ring-4 focus:ring-[--color-accent-500]/10 disabled:cursor-not-allowed disabled:opacity-70"
        style={{ fontFamily: MONO }}
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">
        {suffix}
      </span>
    </div>
  );
}

function MetaRow({
  label,
  value,
  sub,
  serif,
  mono,
}: {
  label: string;
  value: string;
  sub?: string;
  serif?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-neutral-100 pb-2 last:border-b-0 last:pb-0">
      <dt
        className="text-[10px] uppercase tracking-[0.2em] text-neutral-500"
        style={{ fontFamily: MONO }}
      >
        {label}
      </dt>
      <dd className="text-right">
        <div
          className={`text-base tracking-tight ${mono ? "tabular-nums" : ""}`}
          style={{
            fontFamily: serif ? SERIF : mono ? MONO : "inherit",
            letterSpacing: serif ? "-0.01em" : undefined,
          }}
        >
          {value}
        </div>
        {sub && (
          <div
            className="mt-0.5 text-[11px] text-neutral-500"
            style={{ fontFamily: MONO }}
          >
            {sub}
          </div>
        )}
      </dd>
    </div>
  );
}
