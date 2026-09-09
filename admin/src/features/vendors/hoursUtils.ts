import type { DayKey, HoursDraft, WeeklyHours } from "./types";

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
