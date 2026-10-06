import { useOrderAlertStore } from "@/contexts/orderAlertStore";

const store = () => useOrderAlertStore.getState();

beforeEach(() => store().reset());

describe("order alerts", () => {
  it("alerts an order once, even when the socket event and the push both arrive", () => {
    expect(store().showNewOrder({ orderId: "o1", receivedAt: 1 })).toBe(true);
    store().dismissNewOrder();
    expect(store().showNewOrder({ orderId: "o1", receivedAt: 2 })).toBe(false);
    expect(store().newOrder).toBeNull();
  });

  it("replaces the banner when a different order arrives", () => {
    store().showNewOrder({ orderId: "o1", receivedAt: 1 });
    expect(store().showNewOrder({ orderId: "o2", receivedAt: 2 })).toBe(true);
    expect(store().newOrder?.orderId).toBe("o2");
  });

  it("de-duplicates scheduled requests the same way", () => {
    const request = { requestId: "SCH-1", scheduledFor: "2026-10-05T07:30:00.000Z" };
    expect(store().showScheduledRequest(request)).toBe(true);
    expect(store().showScheduledRequest(request)).toBe(false);
  });

  it("forgets everything on sign-out", () => {
    store().showNewOrder({ orderId: "o1", receivedAt: 1 });
    store().reset();
    expect(store().newOrder).toBeNull();
    expect(store().showNewOrder({ orderId: "o1", receivedAt: 3 })).toBe(true);
  });

  it("keeps the memory of seen ids bounded", () => {
    for (let i = 0; i < 120; i++) store().showNewOrder({ orderId: `o${i}`, receivedAt: i });
    expect(store().seen.length).toBeLessThanOrEqual(50);
    expect(store().seen).toContain("o119");
  });
});
