import { fromYmd, isOverOneYear, toYmd, validateStatementDates } from "../statementDates";

const bounds = { minDate: "2026-03-10", maxDate: "2026-10-17" };
const d = (ymd: string) => fromYmd(ymd);

describe("validateStatementDates", () => {
  it("accepts dates between the day the driver started and today", () => {
    expect(validateStatementDates(d("2026-03-10"), d("2026-10-17"), bounds)).toBeNull();
    expect(validateStatementDates(d("2026-09-01"), d("2026-09-01"), bounds)).toBeNull();
  });

  it("asks for both dates", () => {
    expect(validateStatementDates(null, d("2026-09-01"), bounds)?.key).toBe("pickFrom");
    expect(validateStatementDates(d("2026-09-01"), null, bounds)?.key).toBe("pickTo");
  });

  it("rejects an end before the start", () => {
    expect(validateStatementDates(d("2026-09-30"), d("2026-09-01"), bounds)?.key).toBe("endBeforeStart");
  });

  it("rejects the future", () => {
    expect(validateStatementDates(d("2026-09-01"), d("2026-10-18"), bounds)?.key).toBe("inFuture");
  });

  it("rejects a start before the driver began, naming that day", () => {
    const error = validateStatementDates(d("2026-03-09"), d("2026-09-01"), bounds, (ymd) => `on ${ymd}`);
    expect(error?.key).toBe("beforeStart");
    expect(error && "params" in error && error.params.date).toBe("on 2026-03-10");
  });
});

describe("isOverOneYear", () => {
  it("is false up to and including the same day a year later", () => {
    expect(isOverOneYear(d("2025-10-17"), d("2026-10-16"))).toBe(false);
    expect(isOverOneYear(d("2025-10-17"), d("2026-10-17"))).toBe(false);
  });

  it("is true after that", () => {
    expect(isOverOneYear(d("2025-10-16"), d("2026-10-17"))).toBe(true);
  });
});

describe("toYmd", () => {
  it("round-trips a local day", () => {
    expect(toYmd(fromYmd("2026-01-05"))).toBe("2026-01-05");
  });
});
