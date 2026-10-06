import type { PartnerOrder } from "@/types/models";
import { mergeOrders, nextHistoryCursor, startOfToday } from "@/utils/orderWindow";

const order = (id: string, createdAt: string, status = "DELIVERED"): PartnerOrder => ({ _id: id, status, totalPrice: 100, createdAt });

describe("startOfToday", () => {
  it("is local midnight of the given day", () => {
    const start = startOfToday(new Date(2026, 9, 4, 18, 45, 12));
    expect([start.getFullYear(), start.getMonth(), start.getDate()]).toEqual([2026, 9, 4]);
    expect([start.getHours(), start.getMinutes(), start.getSeconds(), start.getMilliseconds()]).toEqual([0, 0, 0, 0]);
  });
});

describe("nextHistoryCursor", () => {
  it("continues from the oldest order of a full page", () => {
    const page = [order("a", "2026-10-03T12:00:00.000Z"), order("b", "2026-10-02T08:30:00.000Z")];
    expect(nextHistoryCursor(page, 2)).toBe("2026-10-02T08:30:00.000Z");
  });

  it("stops once a page comes back short — there is nothing older", () => {
    expect(nextHistoryCursor([order("a", "2026-10-03T12:00:00.000Z")], 2)).toBeUndefined();
    expect(nextHistoryCursor([], 25)).toBeUndefined();
  });
});

describe("mergeOrders", () => {
  it("lists each order once, newest first", () => {
    const live = [order("today", "2026-10-04T10:00:00.000Z", "CREATED")];
    const history = [order("yesterday", "2026-10-03T10:00:00.000Z"), order("older", "2026-10-01T10:00:00.000Z")];
    expect(mergeOrders(history, live).map((o) => o._id)).toEqual(["today", "yesterday", "older"]);
  });

  it("keeps the copy from the first list when an order is in two", () => {
    const fresh = order("x", "2026-10-02T10:00:00.000Z", "CANCELLED");
    const stale = order("x", "2026-10-02T10:00:00.000Z", "CREATED");
    const merged = mergeOrders([fresh], [stale]);
    expect(merged).toHaveLength(1);
    expect(merged[0].status).toBe("CANCELLED");
  });

  it("ignores lists that haven't loaded", () => {
    expect(mergeOrders(undefined, [order("a", "2026-10-02T10:00:00.000Z")], undefined)).toHaveLength(1);
  });
});
