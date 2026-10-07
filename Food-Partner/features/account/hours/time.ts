import { DAY_KEYS, type DayHours, type WeekHours } from "@/types/hours";

// Pure helpers for the opening-hours screen — no React, so they are unit-tested.

export interface TimeParts {
  hour12: number; // 1–12
  minute: number; // 0–59
  pm: boolean;
}

export const toParts = (hhmm: string): TimeParts => {
  const [h, m] = hhmm.split(":").map(Number);
  const hour = Number.isFinite(h) ? h : 9;
  return { hour12: hour % 12 || 12, minute: Number.isFinite(m) ? m : 0, pm: hour >= 12 };
};

export const fromParts = ({ hour12, minute, pm }: TimeParts): string => {
  const hour = (hour12 % 12) + (pm ? 12 : 0);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

/** "21:30" → "9:30 PM". */
export const timeLabel = (hhmm: string) => {
  const { hour12, minute, pm } = toParts(hhmm);
  return `${hour12}:${String(minute).padStart(2, "0")} ${pm ? "PM" : "AM"}`;
};

export const isAllDay = (day: DayHours) => !day.closed && day.open === day.close;
/** The day's close lands after midnight (18:00 → 02:00). */
export const closesNextDay = (day: DayHours) => !day.closed && day.close < day.open;

export const DEFAULT_DAY: DayHours = { open: "09:00", close: "22:00", closed: false };
export const ALL_DAY: Pick<DayHours, "open" | "close"> = { open: "00:00", close: "00:00" };

export const defaultWeek = (): WeekHours =>
  Object.fromEntries(DAY_KEYS.map((day) => [day, { ...DEFAULT_DAY }])) as WeekHours;

/** Today's key in the business timezone (IST), Monday-first like the backend. */
export const todayKey = (now = new Date()): (typeof DAY_KEYS)[number] => {
  const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60_000);
  return DAY_KEYS[(ist.getDay() + 6) % 7];
};
