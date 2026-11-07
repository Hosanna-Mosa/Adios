/**
 * The checks on a statement's dates, run on the phone before asking the server (which runs the
 * same ones again). Days are plain local calendar days: a driver's "1 Oct" is 1 Oct.
 */

export interface StatementBounds {
  /** First day the driver can ask for: the day they started, "YYYY-MM-DD". */
  minDate: string;
  /** Last day: today, "YYYY-MM-DD". */
  maxDate: string;
}

export type StatementDateError =
  | { key: "pickFrom"; fallback: string }
  | { key: "pickTo"; fallback: string }
  | { key: "endBeforeStart"; fallback: string }
  | { key: "beforeStart"; fallback: string; params: { date: string } }
  | { key: "inFuture"; fallback: string };

/** "YYYY-MM-DD" for a local calendar day. */
export function toYmd(date: Date): string {
  const y = String(date.getFullYear()).padStart(4, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Local noon of a "YYYY-MM-DD" day (noon keeps it on the right day across DST shifts). */
export function fromYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

/** True when the period runs past one calendar year: the server emails those instead of showing them. */
export function isOverOneYear(from: Date, to: Date): boolean {
  const limit = new Date(from.getFullYear() + 1, from.getMonth(), from.getDate());
  return toYmd(to) > toYmd(limit);
}

/** The first problem with the chosen dates, or null when they are good to send. */
export function validateStatementDates(
  from: Date | null,
  to: Date | null,
  bounds: StatementBounds,
  formatDate: (ymd: string) => string = (ymd) => ymd,
): StatementDateError | null {
  if (!from) return { key: "pickFrom", fallback: "Choose a start date." };
  if (!to) return { key: "pickTo", fallback: "Choose an end date." };

  const f = toYmd(from);
  const t = toYmd(to);
  if (f > t) return { key: "endBeforeStart", fallback: "The start date must be on or before the end date." };
  if (t > bounds.maxDate) return { key: "inFuture", fallback: "The end date can't be in the future." };
  if (f < bounds.minDate) {
    return {
      key: "beforeStart",
      fallback: "You started on {{date}}. Choose a start date on or after that.",
      params: { date: formatDate(bounds.minDate) },
    };
  }
  return null;
}
