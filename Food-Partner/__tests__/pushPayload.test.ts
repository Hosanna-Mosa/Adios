import { parsePushPayload, pushTarget, pushTargetFromData } from "@/utils/pushPayload";

// The shapes backend/src/modules/orders/orders.service.ts sends.
const newOrderPush = {
  kind: "new_order",
  orderId: "66aa11bb22cc",
  customerName: "Ravi",
  totalPrice: 540,
  deepLink: { app: "admin", screen: "/vendor/dashboard" },
};

const scheduledPush = {
  kind: "scheduled_request",
  requestId: "SCH-1759560000000-4821",
  customerName: "Meena",
  customerPhone: "9876543210",
  scheduledFor: "2026-10-05T07:30:00.000Z",
  deepLink: { app: "admin", screen: "/vendor/scheduled-orders" },
};

describe("parsePushPayload", () => {
  it("reads a new-order push", () => {
    expect(parsePushPayload(newOrderPush)).toEqual({ kind: "new_order", orderId: "66aa11bb22cc", customerName: "Ravi", totalPrice: 540 });
  });

  it("reads a scheduled-request push", () => {
    expect(parsePushPayload(scheduledPush)).toMatchObject({ kind: "scheduled_request", requestId: "SCH-1759560000000-4821", scheduledFor: "2026-10-05T07:30:00.000Z" });
  });

  it("drops malformed optional fields instead of trusting them", () => {
    expect(parsePushPayload({ ...newOrderPush, totalPrice: "540", customerName: 7 })).toEqual({ kind: "new_order", orderId: "66aa11bb22cc", customerName: undefined, totalPrice: undefined });
  });

  it("ignores anything that isn't one of the two alerts", () => {
    expect(parsePushPayload({ kind: "new_order" })).toBeNull(); // no order id
    expect(parsePushPayload({ category: "chat", ticketId: "T-1" })).toBeNull();
    expect(parsePushPayload(null)).toBeNull();
    expect(parsePushPayload("new_order")).toBeNull();
  });
});

describe("pushTarget", () => {
  it("opens the order for a new-order push and the requests list for a scheduled one", () => {
    expect(pushTarget(parsePushPayload(newOrderPush))).toEqual({ pathname: "/order/[id]", params: { id: "66aa11bb22cc" } });
    expect(pushTarget(parsePushPayload(scheduledPush))).toEqual({ pathname: "/scheduled-orders" });
  });

  it("goes nowhere for other notifications", () => {
    expect(pushTarget(null)).toBeNull();
  });
});

describe("pushTargetFromData", () => {
  it("keeps the live alerts going where they went", () => {
    expect(pushTargetFromData(newOrderPush)).toEqual({ pathname: "/order/[id]", params: { id: "66aa11bb22cc" } });
    expect(pushTargetFromData(scheduledPush)).toEqual({ pathname: "/scheduled-orders" });
  });

  it("routes order updates, payouts and support replies", () => {
    expect(pushTargetFromData({ kind: "order_update", orderId: "ADSF010125123456" })).toEqual({ pathname: "/order/[id]", params: { id: "ADSF010125123456" } });
    expect(pushTargetFromData({ kind: "payout" })).toEqual({ pathname: "/payouts" });
    expect(pushTargetFromData({ kind: "support_reply", ticketId: "T-9" })).toEqual({ pathname: "/support-chat", params: { ticketId: "T-9" } });
    expect(pushTargetFromData({ kind: "support_reply" })).toEqual({ pathname: "/support" });
  });

  it("opens an announcement's screen only when it is on the allow-list", () => {
    expect(pushTargetFromData({ kind: "announcement", screen: "/payouts" })).toEqual({ pathname: "/payouts" });
    expect(pushTargetFromData({ kind: "announcement", screen: "/(tabs)/menu" })).toEqual({ pathname: "/(tabs)/menu" });
    expect(pushTargetFromData({ kind: "announcement", screen: "/login" })).toBeNull();
    expect(pushTargetFromData({ kind: "announcement" })).toBeNull();
  });

  it("goes nowhere for unknown or empty data", () => {
    expect(pushTargetFromData(null)).toBeNull();
    expect(pushTargetFromData({ kind: "mystery" })).toBeNull();
  });
});
