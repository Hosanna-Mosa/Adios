export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

export type WeeklyHours = Partial<Record<DayKey, DayHours>>;

/** Server-evaluated open/closed verdict returned on a vendor/meat-center row. */
export interface OpenState {
  isOpen: boolean;
  label: string;
  opensAt: string | null;
  today: string | null;
  week: { day: string; hours: string }[];
}

export type HoursDraft = Record<DayKey, { open: string; close: string; closed: boolean }>;

/**
 * Weekly-hours/availability helpers, promoted here from features/vendors/
 * once features/catalog/ (MeatCenters, work queue item #5) needed the
 * exact same logic byte-for-byte -- not a business concept either feature
 * owns, so per the "does it know business logic? how many features use
 * it?" placement rule this belongs in shared, not duplicated per feature.
 */
export const WEEK_DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

export const toHoursDraft = (hours?: WeeklyHours): HoursDraft =>
  WEEK_DAYS.reduce((draft, { key }) => {
    const day = hours?.[key];
    draft[key] = {
      open: day?.open || "09:00",
      close: day?.close || "22:00",
      closed: day?.closed === true,
    };
    return draft;
  }, {} as HoursDraft);

export const toWeeklyHours = (draft: HoursDraft): WeeklyHours =>
  WEEK_DAYS.reduce((hours, { key }) => {
    const day = draft[key];
    hours[key] = day.closed ? { open: day.open, close: day.close, closed: true } : { open: day.open, close: day.close };
    return hours;
  }, {} as WeeklyHours);

export const hasWeeklyHours = (hours?: WeeklyHours) => !!hours && Object.keys(hours).length > 0;
