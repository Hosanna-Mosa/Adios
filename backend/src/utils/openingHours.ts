export interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type WeeklyHours = Partial<Record<DayKey, DayHours>>;

export interface OpenState {
  isOpen: boolean;
  label: string;
  opensAt: string | null;
  today: string | null;
  week: { day: string; hours: string }[];
}

/**
 * Legacy hours captured by partner onboarding (Vendor.operations). Days are full
 * English names ("Monday") and every slot is a 24h "HH:mm" pair.
 */
export interface LegacyOperationsHours {
  selectedDays?: string[];
  timeSlots?: { open?: string; close?: string }[];
  dayTimeSlots?: Record<string, { open?: string; close?: string }[]>;
}

export interface OutletHoursSource {
  openingHours?: WeeklyHours | null;
  isManuallyClosed?: boolean;
  isOpen?: boolean;
  operations?: LegacyOperationsHours | null;
}

export const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const DAY_LABELS: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const SHORT_DAY_LABELS: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

const LEGACY_DAY_KEYS: Record<string, DayKey> = {
  monday: "mon",
  tuesday: "tue",
  wednesday: "wed",
  thursday: "thu",
  friday: "fri",
  saturday: "sat",
  sunday: "sun",
};

const MINUTES_IN_DAY = 24 * 60;

// The business runs on IST. The server may not, and nothing else in the backend
// pins a timezone (zones.service.ts reads bare server-local time), so resolve the
// weekday and clock explicitly instead of trusting the host clock's offset.
const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE || "Asia/Kolkata";

interface DayWindow {
  openMinutes: number;
  closeMinutes: number;
}

/** null = no usable information for that day, false = explicitly closed. */
type NormalizedDay = DayWindow | false | null;

const parseMinutes = (value: unknown): number | null => {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (minutes > 59) return null;
  if (hours === 24 && minutes === 0) return MINUTES_IN_DAY;
  if (hours > 23) return null;
  return hours * 60 + minutes;
};

const formatTime = (minutes: number): string => {
  const normalized = ((minutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(mins).padStart(2, "0")} ${suffix}`;
};

const formatWindow = (window: DayWindow): string => {
  if (window.closeMinutes - window.openMinutes >= MINUTES_IN_DAY) return "Open 24 hours";
  return `${formatTime(window.openMinutes)} – ${formatTime(window.closeMinutes)}`;
};

const normalizeDay = (entry: DayHours | undefined): NormalizedDay => {
  if (!entry) return null;
  if (entry.closed === true) return false;

  const openMinutes = parseMinutes(entry.open);
  const closeMinutes = parseMinutes(entry.close);
  if (openMinutes === null || closeMinutes === null) return null;

  // "09:00"–"09:00" is the industry shorthand for round the clock; a close that
  // lands before the open (18:00 → 02:00) spills into the following day.
  if (closeMinutes === openMinutes) return { openMinutes: 0, closeMinutes: MINUTES_IN_DAY };
  if (closeMinutes < openMinutes) return { openMinutes, closeMinutes: closeMinutes + MINUTES_IN_DAY };
  return { openMinutes, closeMinutes };
};

const normalizeWeek = (hours: WeeklyHours | undefined) => {
  const week: Record<DayKey, NormalizedDay> = {
    mon: null,
    tue: null,
    wed: null,
    thu: null,
    fri: null,
    sat: null,
    sun: null,
  };

  let configured = false;
  if (hours) {
    for (const key of DAY_KEYS) {
      const normalized = normalizeDay(hours[key]);
      week[key] = normalized;
      if (normalized !== null) configured = true;
    }
  }

  return { week, configured };
};

/** Weekday index (0 = Monday) and minutes since midnight, in the business timezone. */
const resolveNow = (now: Date): { dayIndex: number; minutes: number } => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: BUSINESS_TIMEZONE,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);

    const weekday = parts.find((part) => part.type === "weekday")?.value || "";
    const hour = Number(parts.find((part) => part.type === "hour")?.value);
    const minute = Number(parts.find((part) => part.type === "minute")?.value);
    const dayIndex = DAY_KEYS.indexOf(weekday.slice(0, 3).toLowerCase() as DayKey);

    if (dayIndex >= 0 && Number.isFinite(hour) && Number.isFinite(minute)) {
      return { dayIndex, minutes: (hour % 24) * 60 + minute };
    }
  } catch {
    // Intl without full ICU data — fall through to the host clock.
  }

  return {
    dayIndex: (now.getDay() + 6) % 7,
    minutes: now.getHours() * 60 + now.getMinutes(),
  };
};

const alwaysOpenState = (): OpenState => ({
  isOpen: true,
  label: "Open now",
  opensAt: null,
  today: null,
  week: [],
});

/**
 * Resolve an outlet's live open/closed state from its weekly schedule.
 *
 * `manuallyClosed` always wins. Absent or unusable hours mean "always open" —
 * a schedule that cannot be read must never hide an outlet or blank its badge.
 */
export function evaluateOpenState(
  hours: WeeklyHours | undefined,
  manuallyClosed?: boolean,
  now?: Date,
): OpenState {
  const { week, configured } = normalizeWeek(hours);

  if (!configured) {
    return manuallyClosed === true
      ? { isOpen: false, label: "Closed", opensAt: null, today: null, week: [] }
      : alwaysOpenState();
  }

  const reference = now instanceof Date && !Number.isNaN(now.getTime()) ? now : new Date();
  const { dayIndex, minutes } = resolveNow(reference);

  const dayAt = (offset: number): DayKey => DAY_KEYS[(dayIndex + offset + 7 * 7) % 7];
  const windowAt = (offset: number): DayWindow | null => {
    const value = week[dayAt(offset)];
    return value ? value : null;
  };

  const weekSummary = DAY_KEYS.map((key) => {
    const value = week[key];
    return {
      day: DAY_LABELS[key],
      hours: value ? formatWindow(value) : "Closed",
    };
  });

  const todayWindow = windowAt(0);
  const today = todayWindow ? formatWindow(todayWindow) : "Closed today";

  const yesterdayWindow = windowAt(-1);
  const isOpenNow =
    (todayWindow !== null && minutes >= todayWindow.openMinutes && minutes < todayWindow.closeMinutes) ||
    (yesterdayWindow !== null && minutes < yesterdayWindow.closeMinutes - MINUTES_IN_DAY);

  if (manuallyClosed === true) {
    return { isOpen: false, label: "Closed", opensAt: null, today, week: weekSummary };
  }

  if (isOpenNow) {
    return { isOpen: true, label: "Open now", opensAt: null, today, week: weekSummary };
  }

  for (let offset = 0; offset < 7; offset += 1) {
    const window = windowAt(offset);
    if (!window) continue;
    if (offset === 0 && minutes >= window.openMinutes) continue;

    const time = formatTime(window.openMinutes);
    const opensAt = offset === 0 ? time : `${SHORT_DAY_LABELS[dayAt(offset)]} ${time}`;
    return { isOpen: false, label: `Closed · opens ${opensAt}`, opensAt, today, week: weekSummary };
  }

  return { isOpen: false, label: "Closed", opensAt: null, today, week: weekSummary };
}

/**
 * Map the legacy partner-onboarding schedule (Vendor.operations) onto WeeklyHours
 * so outlets onboarded before `openingHours` existed still report real timings.
 */
export function weeklyHoursFromOperations(
  operations: LegacyOperationsHours | null | undefined,
): WeeklyHours | undefined {
  if (!operations || typeof operations !== "object") return undefined;

  const dayTimeSlots =
    operations.dayTimeSlots && typeof operations.dayTimeSlots === "object" ? operations.dayTimeSlots : {};
  const slotsByDay = new Map<string, { open?: string; close?: string }[]>();
  for (const [name, slots] of Object.entries(dayTimeSlots)) {
    if (Array.isArray(slots)) slotsByDay.set(String(name).trim().toLowerCase(), slots);
  }

  const defaultSlot = Array.isArray(operations.timeSlots) ? operations.timeSlots[0] : undefined;
  const selectedDays = Array.isArray(operations.selectedDays)
    ? operations.selectedDays.map((day) => String(day).trim().toLowerCase())
    : [];
  const everyDaySelected = selectedDays.length === 0;

  const hours: WeeklyHours = {};
  let configured = false;

  for (const [name, key] of Object.entries(LEGACY_DAY_KEYS)) {
    if (!everyDaySelected && !selectedDays.includes(name)) {
      hours[key] = { open: "", close: "", closed: true };
      configured = true;
      continue;
    }

    const slot = slotsByDay.get(name)?.[0] || defaultSlot;
    if (slot && typeof slot.open === "string" && typeof slot.close === "string" && slot.open && slot.close) {
      hours[key] = { open: slot.open, close: slot.close };
      configured = true;
    }
  }

  return configured ? hours : undefined;
}

/**
 * Open state for a stored outlet document (Vendor or MeatCenter). `openingHours`
 * wins; onboarding's legacy `operations` schedule is the fallback. The pre-existing
 * `isOpen: false` admin switch keeps working as a manual close.
 */
export function evaluateOutletOpenState(outlet: OutletHoursSource | null | undefined, now?: Date): OpenState {
  if (!outlet) return alwaysOpenState();

  const hours =
    outlet.openingHours && Object.keys(outlet.openingHours).length > 0
      ? outlet.openingHours
      : weeklyHoursFromOperations(outlet.operations);

  const manuallyClosed = outlet.isManuallyClosed === true || outlet.isOpen === false;
  return evaluateOpenState(hours, manuallyClosed, now);
}
