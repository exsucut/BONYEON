// Main orchestrator.
// docs/10-engine-manseryeok-spec-v0.1.md §4 Pipeline, §9 Public API
//
// v0.1 scope:
//   - Solar calendar input only (lunar conversion: TODO)
//   - Fixed KST (UTC+9) — no timezone history, no DST
//   - No true solar time correction (longitude/EOT) — TODO
//   - Unified 자시 is fully implemented; split/offset30 are approximated
//
// These limitations are surfaced in `trace.warnings`.

import { HIDDEN_STEMS } from "./constants/hidden-stems.js";
import { kongmang } from "./constants/kongmang.js";
import { napeum } from "./constants/napeum.js";
import { dayPillarForCivilDate } from "./pillars/day.js";
import { hourPillar, type HourPillarResult } from "./pillars/hour.js";
import { monthPillar } from "./pillars/month.js";
import { yearPillar } from "./pillars/year.js";
import { findBracketingMajorTerms, solarLongitudeAtUtc } from "./solar-terms.js";
import type { ManseryeokInput, ManseryeokOutput, Pillar } from "./types.js";

const KST_OFFSET_MIN = 540;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatKstIso(year: number, month: number, day: number, hour: number, minute: number): string {
  return `${String(year).padStart(4, "0")}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:00+09:00`;
}

function kstCivilToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const ms = Date.UTC(year, month - 1, day, hour, minute, 0);
  return new Date(ms - KST_OFFSET_MIN * 60 * 1000);
}

export function compute(input: ManseryeokInput): ManseryeokOutput {
  const warnings: string[] = [];

  if (input.calendarType === "lunar") {
    warnings.push(
      "음력 변환이 v0.1에서는 미구현입니다. 입력을 양력으로 해석해 처리합니다.",
    );
  }
  if (input.conventions.useTrueSolarTime) {
    warnings.push("진태양시 보정이 v0.1에서는 미구현입니다. KST 그대로 사용합니다.");
  }
  if (input.location.timezoneOverride !== undefined) {
    warnings.push(
      "timezoneOverride가 v0.1에서는 미구현입니다. KST(+09:00)로 계산합니다.",
    );
  }
  if (input.conventions.jasi === "split" || input.conventions.jasi === "offset30") {
    warnings.push(
      `자시 관례 '${input.conventions.jasi}'는 v0.1에서 근사 처리됩니다. v0.2에서 완전 구현 예정.`,
    );
  }

  // ── Step 1~5: Time processing ───────────────────────────────────
  const { year: y, month: m, day: d } = input.date;
  const hour = input.time?.hour ?? 0;
  const minute = input.time?.minute ?? 0;

  const userInputIso = input.time
    ? formatKstIso(y, m, d, hour, minute)
    : `${String(y).padStart(4, "0")}-${pad2(m)}-${pad2(d)}`;
  const birthUtc = kstCivilToUtc(y, m, d, hour, minute);

  // ── Step 6: Solar term context ───────────────────────────────────
  const { previous, next } = findBracketingMajorTerms(birthUtc);
  const solarLon = solarLongitudeAtUtc(birthUtc);

  // ── Step 7: Year pillar ─────────────────────────────────────────
  const year = yearPillar(birthUtc);

  // ── Step 8: Month pillar ────────────────────────────────────────
  const month = monthPillar(birthUtc, year.pillar.stem.index);

  // ── Step 9: Hour pillar first (for civil-date shift), then day pillar ──
  //
  // Day pillar depends on the civil date *after* jasi adjustment. If 자시
  // (unified) rolls the day forward, we use (y, m, d+1) for day pillar.
  let hourResult: HourPillarResult | null = null;
  let civilDateShift: 0 | 1 = 0;

  if (input.time) {
    // Use provisional day stem for hour. Compute day pillar *twice* if needed:
    // first assuming no shift, use its stem for 오서둔, then adjust.
    //
    // Actually the 오서둔 rule says: 시주 간 = f(일간, 시지). The day in question
    // is the "pillar day", which for unified 자시 at 23:xx is *tomorrow*.
    // We handle this by computing hour branch + shift first (does NOT depend on
    // day stem), then computing the actual day pillar with shift, then deriving
    // the hour stem from that day stem.
    const provisional = hourPillar(hour, minute, 0, input.conventions.jasi);
    civilDateShift = provisional.civilDateShift;
  }

  const shiftedDate = applyCivilShift(y, m, d, civilDateShift);
  const day = dayPillarForCivilDate(shiftedDate.year, shiftedDate.month, shiftedDate.day);

  if (input.time) {
    hourResult = hourPillar(hour, minute, day.pillar.stem.index, input.conventions.jasi);
  }

  // ── Step 10: 지장간 / 공망 / 납음 ────────────────────────────────
  const hiddenStems = {
    year: HIDDEN_STEMS[year.pillar.branch.index] ?? [],
    month: HIDDEN_STEMS[month.pillar.branch.index] ?? [],
    day: HIDDEN_STEMS[day.pillar.branch.index] ?? [],
    hour: hourResult
      ? (HIDDEN_STEMS[hourResult.pillar.branch.index] ?? [])
      : null,
  };

  const kongmangByDay = kongmang(day.pillar.stem.index, day.pillar.branch.index);
  const kongmangByYear = kongmang(year.pillar.stem.index, year.pillar.branch.index);

  const napeumOf = (p: Pillar) => napeum(p.stem.index, p.branch.index);

  // ── Step 11: Trace assembly ──────────────────────────────────────
  const dayOfWeek = (((day.jdn + 1) % 7) + 7) % 7; // JDN 0 is Monday of Jan 1, 4713 BC (proleptic Julian) — adjust
  // Actually JDN % 7: 2451545 (2000-01-01) was Saturday. 2451545 % 7 = 5. So dayOfWeek (0=Sun) = (JDN + 1) % 7.

  return {
    pillars: {
      year: year.pillar,
      month: month.pillar,
      day: day.pillar,
      hour: hourResult?.pillar ?? null,
    },
    hiddenStems,
    calendar: {
      solar: userInputIso,
      lunar: null, // TODO
      dayOfWeek,
    },
    kongmang: {
      byDay: kongmangByDay,
      byYear: kongmangByYear,
    },
    napeum: {
      year: napeumOf(year.pillar),
      month: napeumOf(month.pillar),
      day: napeumOf(day.pillar),
      hour: hourResult ? napeumOf(hourResult.pillar) : null,
    },
    trace: {
      timeProcessing: {
        userInput: userInputIso,
        afterCalendarConversion: userInputIso,
        afterTimezoneNormalization: userInputIso,
        afterDSTRollback: userInputIso,
        trueSolarTime: userInputIso,
      },
      timezone: {
        meridian: 135,
        offsetMinutes: KST_OFFSET_MIN,
        periodName: "1961–present (UTC+9, KST)",
      },
      dst: { applied: false },
      trueSolarCorrection: {
        enabled: false,
        longitudeCorrectionMinutes: 0,
        equationOfTimeMinutes: 0,
        totalCorrectionMinutes: 0,
      },
      solarTerms: {
        previousMajor: { name: previous.name, utc: previous.utc.toISOString() },
        nextMajor: { name: next.name, utc: next.utc.toISOString() },
        solarLongitudeAtBirth: solarLon,
        dataSource: "Meeus",
      },
      pillarDecisions: {
        year: {
          ipchunUtc: year.ipchunUtc.toISOString(),
          birthRelativeToIpchun: year.birthRelativeToIpchun,
          effectiveYear: year.effectiveYear,
        },
        month: {
          governingTermName: month.governingTermName,
          wuhutunRule: month.wuhutunRule,
        },
        day: {
          jdn: day.jdn,
          referenceAnchor: { date: "2000-01-01", pillar: "丁酉" },
          jasiAdjustment: civilDateShift === 1 ? "rolled-forward" : "none",
        },
        hour: hourResult
          ? {
              jasiConvention: input.conventions.jasi,
              wusodunRule: hourResult.wusodunRule,
            }
          : null,
      },
      warnings,
    },
  };
}

function applyCivilShift(
  year: number,
  month: number,
  day: number,
  shift: 0 | 1,
): { year: number; month: number; day: number } {
  if (shift === 0) return { year, month, day };
  // Add 1 day via Date arithmetic to handle month/year rollover
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + 1);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}
