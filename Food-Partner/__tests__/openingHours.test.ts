import { closesNextDay, defaultWeek, fromParts, isAllDay, timeLabel, todayKey, toParts } from "@/features/account/hours/time";

describe("opening-hours time helpers", () => {
  it("round-trips 24-hour times through 12-hour parts", () => {
    for (const hhmm of ["00:00", "00:30", "09:00", "12:00", "12:45", "13:15", "21:30", "23:59"]) {
      expect(fromParts(toParts(hhmm))).toBe(hhmm);
    }
    expect(toParts("00:15")).toEqual({ hour12: 12, minute: 15, pm: false });
    expect(toParts("12:00")).toEqual({ hour12: 12, minute: 0, pm: true });
  });

  it("labels times the way the backend's open-state label does", () => {
    expect(timeLabel("09:00")).toBe("9:00 AM");
    expect(timeLabel("21:30")).toBe("9:30 PM");
    expect(timeLabel("00:00")).toBe("12:00 AM");
  });

  it("reads 24 hours and past-midnight windows", () => {
    expect(isAllDay({ open: "00:00", close: "00:00", closed: false })).toBe(true);
    expect(isAllDay({ open: "00:00", close: "00:00", closed: true })).toBe(false);
    expect(closesNextDay({ open: "18:00", close: "02:00", closed: false })).toBe(true);
    expect(closesNextDay({ open: "09:00", close: "22:00", closed: false })).toBe(false);
  });

  it("defaults to every day 9 AM – 10 PM", () => {
    expect(Object.values(defaultWeek())).toEqual(Array(7).fill({ open: "09:00", close: "22:00", closed: false }));
  });

  it("finds today in IST", () => {
    // 2026-10-07 20:00 UTC is Thursday 01:30 in India.
    expect(todayKey(new Date("2026-10-07T20:00:00Z"))).toBe("thu");
    expect(todayKey(new Date("2026-10-07T10:00:00Z"))).toBe("wed");
  });
});
