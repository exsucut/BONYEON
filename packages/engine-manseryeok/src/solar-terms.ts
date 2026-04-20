// 태양 황경 및 24절기 계산 (Meeus Ch. 25 simplified).
// docs/10-engine-manseryeok-spec-v0.1.md §5.3, §부록F
//
// v0.1: Meeus low-precision 알고리즘만 사용. 정확도 ±1분 수준.
// KASI 테이블 통합은 차기 릴리스.

import { jdFromUtc, jdnFromCivilDate, utcFromJd } from "./julian.js";

const DEG = Math.PI / 180;

/**
 * Apparent solar ecliptic longitude in degrees [0, 360), for the given Julian Date.
 * Meeus 2nd ed., Ch. 25, low-precision (~0.01 deg accuracy).
 */
export function solarLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525; // Julian centuries from J2000

  // Mean longitude (corrected for aberration)
  let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;

  // Mean anomaly of the Sun
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mrad = M * DEG;

  // Equation of center
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);

  // True longitude
  let trueLong = L0 + C;

  // Apparent longitude: correction for nutation/aberration
  const omega = 125.04 - 1934.136 * T;
  const apparent = trueLong - 0.00569 - 0.00478 * Math.sin(omega * DEG);

  // Normalize to [0, 360)
  let normalized = apparent % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

/** Signed angular difference a - b, normalized to [-180, 180). */
function angleDiff(a: number, b: number): number {
  let d = (a - b) % 360;
  if (d >= 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

/**
 * Find the UTC instant when solar longitude equals `targetDeg` (e.g. 315 for 입춘).
 * Uses Newton iteration from a seed JD.
 * Returns JD.
 */
export function findSolarLongitudeJd(targetDeg: number, seedJd: number): number {
  let jd = seedJd;
  for (let iter = 0; iter < 20; iter++) {
    const current = solarLongitude(jd);
    const diff = angleDiff(targetDeg, current); // deg
    if (Math.abs(diff) < 1e-6) break;
    // Sun moves ~0.9856 deg/day
    jd += diff / 0.9856473;
  }
  return jd;
}

/**
 * 24절기 이름 (한글/한자) — 황경 0°부터 15° 간격.
 * 황경 315° = 입춘 = 월지 寅 시작.
 */
export const SOLAR_TERMS: ReadonlyArray<{
  readonly name: string;
  readonly han: string;
  readonly longitude: number;
  readonly isMajor: boolean; // 節 vs 氣
}> = [
  { name: "춘분", han: "春分", longitude: 0, isMajor: false },
  { name: "청명", han: "淸明", longitude: 15, isMajor: true },
  { name: "곡우", han: "穀雨", longitude: 30, isMajor: false },
  { name: "입하", han: "立夏", longitude: 45, isMajor: true },
  { name: "소만", han: "小滿", longitude: 60, isMajor: false },
  { name: "망종", han: "芒種", longitude: 75, isMajor: true },
  { name: "하지", han: "夏至", longitude: 90, isMajor: false },
  { name: "소서", han: "小暑", longitude: 105, isMajor: true },
  { name: "대서", han: "大暑", longitude: 120, isMajor: false },
  { name: "입추", han: "立秋", longitude: 135, isMajor: true },
  { name: "처서", han: "處暑", longitude: 150, isMajor: false },
  { name: "백로", han: "白露", longitude: 165, isMajor: true },
  { name: "추분", han: "秋分", longitude: 180, isMajor: false },
  { name: "한로", han: "寒露", longitude: 195, isMajor: true },
  { name: "상강", han: "霜降", longitude: 210, isMajor: false },
  { name: "입동", han: "立冬", longitude: 225, isMajor: true },
  { name: "소설", han: "小雪", longitude: 240, isMajor: false },
  { name: "대설", han: "大雪", longitude: 255, isMajor: true },
  { name: "동지", han: "冬至", longitude: 270, isMajor: false },
  { name: "소한", han: "小寒", longitude: 285, isMajor: true },
  { name: "대한", han: "大寒", longitude: 300, isMajor: false },
  { name: "입춘", han: "立春", longitude: 315, isMajor: true },
  { name: "우수", han: "雨水", longitude: 330, isMajor: false },
  { name: "경칩", han: "驚蟄", longitude: 345, isMajor: true },
];

/**
 * Approximate calendar date when sun reaches each 15° longitude.
 * Used as a seed for Newton iteration. Must be within ~5 days of the actual term.
 */
const SEED_TABLE: ReadonlyArray<{
  readonly longitude: number;
  readonly month: number;
  readonly day: number;
}> = [
  // Terms in Mar–Dec of the target year (longitude 0..270)
  { longitude: 0, month: 3, day: 20 },
  { longitude: 15, month: 4, day: 5 },
  { longitude: 30, month: 4, day: 20 },
  { longitude: 45, month: 5, day: 5 },
  { longitude: 60, month: 5, day: 21 },
  { longitude: 75, month: 6, day: 5 },
  { longitude: 90, month: 6, day: 21 },
  { longitude: 105, month: 7, day: 7 },
  { longitude: 120, month: 7, day: 22 },
  { longitude: 135, month: 8, day: 7 },
  { longitude: 150, month: 8, day: 23 },
  { longitude: 165, month: 9, day: 8 },
  { longitude: 180, month: 9, day: 23 },
  { longitude: 195, month: 10, day: 8 },
  { longitude: 210, month: 10, day: 23 },
  { longitude: 225, month: 11, day: 7 },
  { longitude: 240, month: 11, day: 22 },
  { longitude: 255, month: 12, day: 7 },
  { longitude: 270, month: 12, day: 22 },
  // Terms in Jan–Mar of the target year (longitude 285..345)
  { longitude: 285, month: 1, day: 5 },
  { longitude: 300, month: 1, day: 20 },
  { longitude: 315, month: 2, day: 4 },
  { longitude: 330, month: 2, day: 19 },
  { longitude: 345, month: 3, day: 5 },
];

function seedJd(year: number, longitudeDeg: number): number {
  const entry = SEED_TABLE.find((e) => e.longitude === longitudeDeg);
  if (!entry) {
    throw new Error(
      `No seed for longitude=${String(longitudeDeg)}. Supported: multiples of 15°.`,
    );
  }
  // jdnFromCivilDate returns JDN at noon UTC; for our seed we want noon UTC of that day.
  return jdnFromCivilDate(year, entry.month, entry.day);
}

/**
 * Find UTC of a given solar term (by longitude) in a given year.
 *
 * NB: Some terms cross year boundaries. This function searches for the solar
 * passage of the given longitude *closest to the calendar year's center*. If
 * you want the 입춘 of 1990 (which is in Feb 1990), pass year=1990, longitude=315.
 * For 소한 of 1990 (also in Jan 1990), pass year=1990, longitude=285.
 */
export function findSolarTermUtc(year: number, longitudeDeg: number): Date {
  const seed = seedJd(year, longitudeDeg);
  const jd = findSolarLongitudeJd(longitudeDeg, seed);
  return utcFromJd(jd);
}

/**
 * Convenience: given a UTC instant, return the longitude of the sun at that moment.
 */
export function solarLongitudeAtUtc(utc: Date): number {
  return solarLongitude(jdFromUtc(utc));
}

/**
 * For a UTC instant, find the bracketing major terms (節).
 * Returns the term immediately before and after the instant.
 * Only 12 major terms are returned (入春, 驚蟄, 淸明, ...).
 */
export function findBracketingMajorTerms(utc: Date): {
  previous: { name: string; han: string; longitude: number; utc: Date };
  next: { name: string; han: string; longitude: number; utc: Date };
} {
  const year = utc.getUTCFullYear();
  const majorTerms = SOLAR_TERMS.filter((t) => t.isMajor);

  // Compute UTC for all 12 major terms in this year + neighbors
  const candidates: Array<{ name: string; han: string; longitude: number; utc: Date }> = [];
  for (const y of [year - 1, year, year + 1]) {
    for (const t of majorTerms) {
      candidates.push({
        name: t.name,
        han: t.han,
        longitude: t.longitude,
        utc: findSolarTermUtc(y, t.longitude),
      });
    }
  }
  candidates.sort((a, b) => a.utc.getTime() - b.utc.getTime());

  let prev = candidates[0]!;
  let next = candidates[candidates.length - 1]!;
  for (let i = 0; i < candidates.length - 1; i++) {
    const a = candidates[i]!;
    const b = candidates[i + 1]!;
    if (a.utc <= utc && utc < b.utc) {
      prev = a;
      next = b;
      break;
    }
  }
  return { previous: prev, next };
}
