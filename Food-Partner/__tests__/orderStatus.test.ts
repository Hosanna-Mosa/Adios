import type { PartnerOrder } from "@/types/models";
import {
  canMarkOrderReady,
  canMarkReady,
  customerOf,
  deliveryAddress,
  isActive,
  isCancelled,
  isCompleted,
  needsAcceptance,
  needsAction,
  orderItemCount,
  orderItems,
  orderStatusMeta,
  statusMeta,
} from "@/utils/orderStatus";

const order = (overrides: Partial<PartnerOrder> = {}): PartnerOrder => ({
  _id: "65f0c0ffee",
  status: "CREATED",
  totalPrice: 420,
  createdAt: "2026-10-04T09:00:00.000Z",
  ...overrides,
});

describe("order status rules", () => {
  it("lets the kitchen mark ready only before the driver picks up — in either case", () => {
    for (const status of ["CREATED", "searching_driver", "DRIVER_ASSIGNED", "arrived_pickup"]) {
      expect(canMarkReady(status)).toBe(true);
    }
    for (const status of ["picking_items", "ON_THE_WAY", "delivered", "CANCELLED", undefined]) {
      expect(canMarkReady(status)).toBe(false);
    }
  });

  it("splits orders into active, completed and cancelled with nothing in two groups", () => {
    const statuses = ["CREATED", "picking_items", "IN_TRANSIT", "DELIVERED", "completed", "CANCELLED"];
    for (const status of statuses) {
      const groups = [isActive(status), isCompleted(status), isCancelled(status)].filter(Boolean);
      expect(groups).toHaveLength(1);
    }
    expect(isCompleted("DELIVERED")).toBe(true);
    expect(isCancelled("cancelled")).toBe(true);
    expect(isActive("IN_TRANSIT")).toBe(true);
  });

  it("labels an unknown status as unknown instead of crashing", () => {
    expect(statusMeta("teleporting")).toEqual({ labelKey: "orderStatus.unknown", tone: "neutral" });
    expect(statusMeta("PICKING_ITEMS").labelKey).toBe("orderStatus.readyForPickup");
  });
});

describe("food orders (accept with a prep time, then mark ready)", () => {
  const food = (overrides: Partial<PartnerOrder> = {}) => order({ dispatchMode: "broadcast", ...overrides });

  it("asks the kitchen to accept a new food order, and offers no Mark as ready until it does", () => {
    const fresh = food();
    expect(needsAcceptance(fresh)).toBe(true);
    expect(canMarkOrderReady(fresh)).toBe(false);
    expect(needsAction(fresh)).toBe(true);
    expect(orderStatusMeta(fresh).labelKey).toBe("orderStatus.newOrder");
  });

  it("offers Mark as ready once accepted, and only once", () => {
    const accepted = food({ status: "SEARCHING_DRIVER", restaurantAcceptedAt: "2026-10-04T09:01:00.000Z", prepMinutes: 20 });
    expect(needsAcceptance(accepted)).toBe(false);
    expect(canMarkOrderReady(accepted)).toBe(true);
    expect(orderStatusMeta(accepted).labelKey).toBe("orderStatus.preparingFindingDriver");

    const ready = { ...accepted, foodReadyAt: "2026-10-04T09:20:00.000Z" };
    expect(canMarkOrderReady(ready)).toBe(false);
    expect(needsAction(ready)).toBe(false);
    expect(orderStatusMeta(ready).labelKey).toBe("orderStatus.readyFindingDriver");
  });

  it("says when an order was cancelled for not being accepted in time", () => {
    const timedOut = food({ status: "CANCELLED", cancelReason: "restaurant_timeout" });
    expect(needsAction(timedOut)).toBe(false);
    expect(orderStatusMeta(timedOut).labelKey).toBe("orderStatus.cancelledNotAccepted");
    expect(orderStatusMeta(food({ status: "CANCELLED" })).labelKey).toBe("orderStatus.cancelled");
  });

  it("leaves every other order (meat, older orders) on Mark as ready with no accept step", () => {
    const meat = order({ status: "SEARCHING_DRIVER" });
    expect(needsAcceptance(meat)).toBe(false);
    expect(canMarkOrderReady(meat)).toBe(true);
    expect(orderStatusMeta(meat).labelKey).toBe("orderStatus.searchingDriver");
    expect(needsAcceptance(food({ status: "CANCELLED" }))).toBe(false);
  });
});

describe("order contents", () => {
  const withDrop = order({
    stops: [
      { type: "pickup", address: "Kitchen, Main Road" },
      {
        type: "drop",
        address: "Fallback address",
        items: {
          lines: [
            { name: "Biryani", quantity: 2, price: 250 },
            { name: "Raita", quantity: 1, price: 40 },
          ],
          deliveryAddress: { formattedAddress: "12 Lake View, Hyderabad" },
        },
      },
    ],
  });

  it("reads the items and their total quantity from the drop stop", () => {
    expect(orderItems(withDrop).map((line) => line.name)).toEqual(["Biryani", "Raita"]);
    expect(orderItemCount(withDrop)).toBe(3);
    expect(orderItems(order())).toEqual([]);
  });

  it("prefers the formatted delivery address and falls back to the stop address", () => {
    expect(deliveryAddress(withDrop)).toBe("12 Lake View, Hyderabad");
    expect(deliveryAddress(order({ stops: [{ type: "drop", address: "Stop only" }] }))).toBe("Stop only");
  });

  it("treats a bare customer id as no customer details", () => {
    expect(customerOf(order({ user: "65f0abc" }))).toBeNull();
    expect(customerOf(order({ user: { name: "Asha", phone: "98480" } }))?.name).toBe("Asha");
  });
});
