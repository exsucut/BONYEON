"use client";

import {
  compute,
  type JasiConvention,
  type ManseryeokOutput,
} from "@bonyeon/engine-manseryeok";
import { useMemo, useState } from "react";

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

type TabKey = "saju" | "ziwei" | "g48" | "axis" | "ennea" | "cross";

const TABS: ReadonlyArray<{ key: TabKey; kr: string; han: string; built: boolean }> = [
  { key: "saju", kr: "사주", han: "四柱", built: true },
  { key: "ziwei", kr: "자미두수", han: "紫微", built: false },
  { key: "g48", kr: "48주", han: "週", built: false },
  { key: "axis", kr: "4축 성향", han: "軸", built: false },
  { key: "ennea", kr: "내면 동기", han: "九", built: false },
  { key: "cross", kr: "교차 인사이트", han: "×", built: false },
];

const SERIF = `"Apple SD Gothic Neo", "Noto Serif KR", "Nanum Myeongjo", "Yu Mincho", serif`;

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

  const result: ManseryeokOutput | null = useMemo(() => {
    try {
      return compute({
        date: { year: form.year, month: form.month, day: form.day },
        time: form.timeUnknown ? null : { hour: form.hour, minute: form.minute },
        calendarType: form.calendarType,
        location: { longitude: 126.978, latitude: 37.5665, cityName: "서울" },
        conventions: { jasi: form.jasi, yearBoundary: "ipchun", useTrueSolarTime: false },
      });
    } catch {
      return null;
    }
  }, [form]);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-screen flex-col bg-[--color-neutral-50] antialiased">
      {/* ── Top bar ───────────────────────────────── */}
      <header className="flex h-14 flex-none items-center justify-between border-b border-neutral-200 bg-[--color-neutral-25] px-4 md:px-6">
        <div className="flex items-baseline gap-2">
          <span
            className="text-lg font-medium leading-none"
            style={{ fontFamily: SERIF }}
          >
            本然
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            BONYEON
          </span>
          <span className="ml-3 hidden rounded-full bg-[--color-accent-500]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[--color-accent-700] sm:inline-block">
            v0.1.0
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-xs text-neutral-600 hover:text-neutral-900"
          >
            저장된 프로필
          </button>
          <a
            href="https://github.com/exsucut/BONYEON"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 hover:text-[--color-accent-700]"
          >
            Source ↗
          </a>
        </div>
      </header>

      {/* ── Main grid ─────────────────────────────── */}
      <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[320px_1fr]">
        {/* Sidebar: input */}
        <aside className="overflow-y-auto border-b border-neutral-200 bg-[--color-neutral-25] px-5 py-6 md:border-b-0 md:border-r">
          <InputPanel form={form} onChange={updateForm} />
        </aside>

        {/* Main: report */}
        <main className="overflow-y-auto">
          {result ? (
            <ReportView
              result={result}
              tab={tab}
              onTabChange={setTab}
              traceOpen={traceOpen}
              onTraceToggle={() => setTraceOpen((v) => !v)}
              profileSummary={profileSummary(form)}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-sm text-neutral-500">
              입력을 확인해주세요.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

function profileSummary(f: FormState): string {
  const genderKr = f.gender === "male" ? "남자" : "여자";
  const calKr = f.calendarType === "solar" ? "양력" : "음력";
  const date = `${f.year}.${String(f.month).padStart(2, "0")}.${String(f.day).padStart(2, "0")}`;
  const time = f.timeUnknown
    ? "시간 모름"
    : `${String(f.hour).padStart(2, "0")}:${String(f.minute).padStart(2, "0")}`;
  return `${calKr} · ${date} · ${time} · ${genderKr}`;
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
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          § Input
        </h2>
        <p className="text-xs text-neutral-500">
          변경 시 즉시 재계산됩니다.
        </p>
      </div>

      {/* Calendar type + gender */}
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

      {/* Date */}
      <div>
        <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          생년월일
        </label>
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
            onChange={(v) => onChange("month", Math.min(12, Math.max(1, v)))}
            min={1}
            max={12}
            suffix="월"
          />
          <NumInput
            value={form.day}
            onChange={(v) => onChange("day", Math.min(31, Math.max(1, v)))}
            min={1}
            max={31}
            suffix="일"
          />
        </div>
      </div>

      {/* Time */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            출생 시간
          </label>
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
        <div
          className={`grid grid-cols-2 gap-2 ${form.timeUnknown ? "opacity-40" : ""}`}
        >
          <NumInput
            value={form.hour}
            onChange={(v) => onChange("hour", Math.min(23, Math.max(0, v)))}
            min={0}
            max={23}
            suffix="시"
            disabled={form.timeUnknown}
          />
          <NumInput
            value={form.minute}
            onChange={(v) => onChange("minute", Math.min(59, Math.max(0, v)))}
            min={0}
            max={59}
            suffix="분"
            disabled={form.timeUnknown}
          />
        </div>
      </div>

      {/* Jasi convention */}
      <Field label="자시 관례">
        <select
          value={form.jasi}
          onChange={(e) => onChange("jasi", e.target.value as JasiConvention)}
          className="w-full rounded-sm border border-neutral-300 bg-[--color-neutral-25] px-3 py-2 text-sm outline-none transition-colors focus:border-[--color-accent-500]"
        >
          <option value="unified">통일 자시 (23:00 기준)</option>
          <option value="split">야자시·조자시 분리</option>
          <option value="offset30">30분 오프셋</option>
        </select>
      </Field>

      {/* Meta */}
      <div className="border-t border-neutral-200 pt-4 text-[11px] text-neutral-500">
        <div className="mb-1">
          출생지: <span className="font-mono">서울</span>{" "}
          <span className="text-neutral-400">(고정, v0.2에서 선택)</span>
        </div>
        <div>
          <span className="font-mono">KST +09:00</span>{" "}
          <span className="text-neutral-400">· 표준시 · 진태양시 보정 없음</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

function ReportView({
  result,
  tab,
  onTabChange,
  traceOpen,
  onTraceToggle,
  profileSummary,
}: {
  result: ManseryeokOutput;
  tab: TabKey;
  onTabChange: (t: TabKey) => void;
  traceOpen: boolean;
  onTraceToggle: () => void;
  profileSummary: string;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Hero summary */}
      <section className="border-b border-neutral-200 bg-[--color-neutral-25] px-6 py-6 md:px-10 md:py-8">
        <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          프로필
        </div>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <h1
            className="text-3xl tracking-tight md:text-4xl"
            style={{ fontFamily: SERIF }}
          >
            {(["year", "month", "day", "hour"] as const)
              .map((k) => {
                const p = result.pillars[k];
                return p ? `${p.stem.han}${p.branch.han}` : "—";
              })
              .join(" ")}
          </h1>
          <span className="font-mono text-xs text-neutral-500">{profileSummary}</span>
        </div>
      </section>

      {/* Tabs */}
      <nav className="flex-none overflow-x-auto border-b border-neutral-200 bg-[--color-neutral-25] px-4 md:px-10">
        <div className="flex gap-0 whitespace-nowrap">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onTabChange(t.key)}
                className={`relative flex items-baseline gap-2 border-b-2 px-3 py-3 text-sm transition-colors ${
                  active
                    ? "border-[--color-accent-500] text-neutral-900"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
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
                  <span className="ml-1 rounded-sm bg-neutral-200 px-1 py-0.5 font-mono text-[9px] uppercase text-neutral-500">
                    soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <section className="flex-1 overflow-y-auto">
        {tab === "saju" ? (
          <SajuPanel result={result} />
        ) : (
          <NotReadyPanel tab={tab} />
        )}

        {/* Trace drawer */}
        <div className="border-t border-neutral-200">
          <button
            type="button"
            onClick={onTraceToggle}
            className="flex w-full items-center justify-between px-6 py-3 text-left font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:bg-neutral-100 md:px-10"
          >
            <span>
              § Trace · 계산 근거{" "}
              <span className="ml-2 text-neutral-400">
                ({result.trace.warnings.length} warnings)
              </span>
            </span>
            <span className="text-neutral-400">{traceOpen ? "▲" : "▼"}</span>
          </button>
          {traceOpen && <TracePanel result={result} />}
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

function SajuPanel({ result }: { result: ManseryeokOutput }) {
  const pillarLabels = {
    year: { kr: "연주", han: "年" },
    month: { kr: "월주", han: "月" },
    day: { kr: "일주", han: "日" },
    hour: { kr: "시주", han: "時" },
  } as const;

  return (
    <div className="px-6 py-8 md:px-10 md:py-10">
      {/* Four pillars grid */}
      <div className="mb-10 grid grid-cols-4 gap-px overflow-hidden rounded-sm border border-neutral-300 bg-neutral-300">
        {(["year", "month", "day", "hour"] as const).map((k) => {
          const p = result.pillars[k];
          const lbl = pillarLabels[k];
          const stems = result.hiddenStems[k];
          return (
            <div
              key={k}
              className="flex min-h-[12rem] flex-col justify-between gap-3 bg-[--color-neutral-25] p-3 md:min-h-[16rem] md:p-5"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                {lbl.kr} · {lbl.han}
              </div>
              {p ? (
                <div className="flex flex-col items-center">
                  <div
                    className="text-4xl leading-none md:text-6xl"
                    style={{ fontFamily: SERIF, letterSpacing: "-0.02em" }}
                  >
                    {p.stem.han}
                    {p.branch.han}
                  </div>
                  <div className="mt-2 font-mono text-[10px] tracking-wider text-neutral-500">
                    {p.stem.kr}
                    {p.branch.kr}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center text-3xl text-neutral-300">
                  —
                </div>
              )}
              {/* 지장간 miniature */}
              <div className="flex flex-wrap items-center justify-center gap-1">
                {stems?.map((hs, i) => (
                  <span
                    key={i}
                    className="rounded-sm bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-600"
                    title={`${hs.type} · ${hs.days}일`}
                  >
                    {hs.stem.han}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Card label="납음 (일주)" value={result.napeum.day} serif />
        <Card
          label="공망 (일주 기준)"
          value={`${result.kongmang.byDay[0].han}·${result.kongmang.byDay[1].han}`}
          sub={`${result.kongmang.byDay[0].kr}·${result.kongmang.byDay[1].kr}`}
          serif
        />
        <Card
          label="직전 절기"
          value={result.trace.solarTerms.previousMajor.name}
          sub={new Date(result.trace.solarTerms.previousMajor.utc)
            .toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" })
            .replace(" 오전", "")
            .replace(" 오후", "")}
        />
        <Card
          label="다음 절기"
          value={result.trace.solarTerms.nextMajor.name}
          sub={new Date(result.trace.solarTerms.nextMajor.utc)
            .toLocaleString("ko-KR", { dateStyle: "medium" })}
        />
        <Card
          label="태양 황경"
          value={`${result.trace.solarTerms.solarLongitudeAtBirth.toFixed(3)}°`}
          mono
        />
        <Card
          label="JDN (일주 기준일)"
          value={result.trace.pillarDecisions.day.jdn.toString()}
          sub={`${result.trace.pillarDecisions.day.referenceAnchor.pillar} 기준`}
          mono
        />
      </div>

      {/* 오행 요약 */}
      <div className="mt-8 rounded-sm border border-neutral-200 bg-[--color-neutral-25] p-5">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          § 오행 분포 (4기둥 간·지)
        </div>
        <OhaengBar result={result} />
      </div>
    </div>
  );
}

function OhaengBar({ result }: { result: ManseryeokOutput }) {
  const tally: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const key of ["year", "month", "day", "hour"] as const) {
    const p = result.pillars[key];
    if (!p) continue;
    tally[p.stem.element] = (tally[p.stem.element] ?? 0) + 1;
    tally[p.branch.element] = (tally[p.branch.element] ?? 0) + 1;
  }
  const total = Object.values(tally).reduce((a, b) => a + b, 0);
  const colors: Record<string, string> = {
    목: "#5B7760",
    화: "#A64A3E",
    토: "#A88B5B",
    금: "#B5B2A8",
    수: "#2E3B4E",
  };

  return (
    <div>
      <div className="mb-2 flex h-3 overflow-hidden rounded-sm bg-neutral-100">
        {(["목", "화", "토", "금", "수"] as const).map((el) => {
          const n = tally[el] ?? 0;
          if (n === 0) return null;
          return (
            <div
              key={el}
              style={{
                width: `${(n / total) * 100}%`,
                backgroundColor: colors[el],
              }}
              title={`${el} ${n}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
        {(["목", "화", "토", "금", "수"] as const).map((el) => (
          <div key={el} className="flex items-center gap-1.5">
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: colors[el] }}
            />
            <span className="text-neutral-500">{el}</span>
            <span className="font-mono tabular-nums text-neutral-900">
              {tally[el]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

function NotReadyPanel({ tab }: { tab: TabKey }) {
  const info = TABS.find((t) => t.key === tab);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-8 py-20 text-center">
      <div
        className="text-7xl leading-none text-neutral-200"
        style={{ fontFamily: SERIF }}
      >
        {info?.han}
      </div>
      <h2 className="text-xl" style={{ fontFamily: SERIF }}>
        {info?.kr}
      </h2>
      <p className="max-w-sm text-sm text-neutral-500">
        이 엔진은 아직 구현되지 않았습니다. 명세는 완료 상태이며, 로드맵(P2)에
        따라 순차 구현됩니다.
      </p>
      <a
        href="https://github.com/exsucut/BONYEON/tree/main/docs"
        className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[--color-accent-700] hover:text-[--color-accent-900]"
      >
        명세 보기 ↗
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

function TracePanel({ result }: { result: ManseryeokOutput }) {
  const t = result.trace;
  return (
    <div className="bg-[--color-neutral-25] px-6 py-5 font-mono text-xs md:px-10">
      <div className="space-y-3 text-neutral-700">
        <TraceRow label="입춘 UTC" value={t.pillarDecisions.year.ipchunUtc} />
        <TraceRow
          label="출생 vs 입춘"
          value={t.pillarDecisions.year.birthRelativeToIpchun}
        />
        <TraceRow
          label="effectiveYear"
          value={t.pillarDecisions.year.effectiveYear.toString()}
        />
        <TraceRow
          label="월주 · 지배 절기"
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
        <TraceRow label="태양 황경" value={`${t.solarTerms.solarLongitudeAtBirth.toFixed(5)}°`} />
        <TraceRow label="천문 데이터" value={t.solarTerms.dataSource} />
      </div>

      {t.warnings.length > 0 && (
        <div className="mt-5 border-t border-neutral-200 pt-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[--color-accent-700]">
            Warnings · {t.warnings.length}
          </div>
          <ul className="space-y-1.5 text-xs text-neutral-600">
            {t.warnings.map((w, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-neutral-400">0{i + 1}</span>
                <span className="font-sans">{w}</span>
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
    <div className="grid grid-cols-[9rem_1fr] gap-4">
      <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </span>
      <span className="text-neutral-900">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Primitives

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </div>
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
    <div className="grid gap-0 overflow-hidden rounded-sm border border-neutral-300 bg-[--color-neutral-25]" style={{gridTemplateColumns:`repeat(${options.length}, 1fr)`}}>
      {options.map((o, i) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`py-2 text-sm transition-colors ${
            value === o.value
              ? "bg-neutral-900 text-[--color-neutral-25]"
              : "text-neutral-600 hover:bg-neutral-100"
          } ${i > 0 ? "border-l border-neutral-300" : ""}`}
        >
          {o.label}
        </button>
      ))}
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
        className="w-full rounded-sm border border-neutral-300 bg-[--color-neutral-25] px-3 py-2 pr-7 font-mono text-sm tabular-nums outline-none transition-colors focus:border-[--color-accent-500] disabled:cursor-not-allowed"
      />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">
        {suffix}
      </span>
    </div>
  );
}

function Card({
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
    <div className="rounded-sm border border-neutral-200 bg-[--color-neutral-25] p-4">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </div>
      <div
        className={`text-2xl tracking-tight ${mono ? "font-mono tabular-nums" : ""}`}
        style={serif ? { fontFamily: SERIF } : undefined}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-neutral-500">{sub}</div>}
    </div>
  );
}
