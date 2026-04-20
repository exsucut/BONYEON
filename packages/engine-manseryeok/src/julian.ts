// Julian Day conversion.
// Reference: Meeus, "Astronomical Algorithms" 2nd ed., Ch. 7.

/**
 * Gregorian civil date (Y, M, D) → integer JDN at noon UTC of that date.
 * Valid for Gregorian calendar dates (after 1582-10-15).
 *
 * Example: 2000-01-01 → 2451545.
 */
export function jdnFromCivilDate(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * JDN → { year, month, day } (Gregorian).
 * Inverse of jdnFromCivilDate.
 */
export function civilDateFromJdn(jdn: number): { year: number; month: number; day: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

/**
 * Full Julian Date (fractional) from UTC instant.
 * JD 2451545.0 = 2000-01-01T12:00:00Z.
 */
export function jdFromUtc(utc: Date): number {
  const ms = utc.getTime();
  return ms / 86400000 + 2440587.5;
}

/**
 * Inverse of jdFromUtc.
 */
export function utcFromJd(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}
