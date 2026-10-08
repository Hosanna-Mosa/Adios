/** Monday-first day keys, as the backend's openingHours uses them. */
export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

/**
 * One day's window, 24-hour "HH:mm". open === close means open 24 hours; a
 * close before the open (18:00 → 02:00) runs past midnight into the next day.
 */
export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export type WeekHours = Record<DayKey, DayHours>;
