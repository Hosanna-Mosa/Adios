import type { PartnerOrder, ScheduledRequest } from "@/types/models";
import { NEW_ORDER_ALERT_WINDOW_MS, newOrdersToAlert, newScheduledRequestsToAlert } from "@/utils/liveOrderDiff";

const NOW = Date.parse("2026-10-08T12:00:00.000Z");
const minutesAgo = (m: number) => new Date(NOW - m * 60_000).toISOString();

const order = (over: Partial<PartnerOrder>): PartnerOrder => ({
  _id: "o1",
  status: "created",
  totalPrice: 250,
  createdAt: minutesAgo(1),
  dispatchMode: "broadcast",
  ...over,
});

const request = (over: Partial<ScheduledRequest>): ScheduledRequest => ({
  requestId: "SCH-1",
  vendorId: "v1",
  customerId: "c1",
  customerName: "Asha",
  customerPhone: "9999999999",
  scheduledFor: "2026-10-09T07:30:00.000Z",
  status: "pending",
  createdAt: minutesAgo(1),
  ...over,
});

const ids = (orders: PartnerOrder[]) => orders.map((o) => o._id);

describe("newOrdersToAlert", () => {
  it("rings for an unseen food order waiting to be accepted", () => {
    expect(ids(newOrdersToAlert([order({})], new Set(), NOW))).toEqual(["o1"]);
  });

  it("rings for an unseen order with no accept step that still needs marking ready", () => {
    const meat = order({ _id: "m1", dispatchMode: "sequential", status: "searching_driver" });
    expect(ids(newOrdersToAlert([meat], new Set(), NOW))).toEqual(["m1"]);
  });

  it("never rings again for an id already seen — so a refetch can't loop", () => {
    expect(newOrdersToAlert([order({})], new Set(["o1"]), NOW)).toEqual([]);
  });

  it("skips orders the kitchen has nothing to do on", () => {
    const orders = [
      order({ _id: "accepted-ready", restaurantAcceptedAt: minutesAgo(1), foodReadyAt: minutesAgo(1), status: "searching_driver" }),
      order({ _id: "cancelled", status: "cancelled" }),
      order({ _id: "delivered", status: "delivered" }),
      order({ _id: "on-the-way", status: "on_the_way", dispatchMode: "sequential" }),
    ];
    expect(newOrdersToAlert(orders, new Set(), NOW)).toEqual([]);
  });

  it("skips orders placed before the alert window, e.g. still open after a reload", () => {
    const windowMinutes = NEW_ORDER_ALERT_WINDOW_MS / 60_000;
    const orders = [order({ _id: "edge", createdAt: minutesAgo(windowMinutes) }), order({ _id: "old", createdAt: minutesAgo(windowMinutes + 1) })];
    expect(ids(newOrdersToAlert(orders, new Set(), NOW))).toEqual(["edge"]);
  });

  it("skips an order whose createdAt can't be read", () => {
    expect(newOrdersToAlert([order({ createdAt: "not a date" })], new Set(), NOW)).toEqual([]);
  });

  it("picks only the new ones out of a mixed poll", () => {
    const orders = [order({ _id: "a" }), order({ _id: "b" }), order({ _id: "c" })];
    expect(ids(newOrdersToAlert(orders, new Set(["a", "c"]), NOW))).toEqual(["b"]);
  });
});

describe("newScheduledRequestsToAlert", () => {
  it("rings for unseen pending requests only", () => {
    const requests = [
      request({ requestId: "new" }),
      request({ requestId: "seen" }),
      request({ requestId: "answered", status: "accepted" }),
      request({ requestId: "declined", status: "rejected" }),
    ];
    expect(newScheduledRequestsToAlert(requests, new Set(["seen"])).map((r) => r.requestId)).toEqual(["new"]);
  });
});
