import { useDeliveryStore } from "../deliveryStore";
import type { DeliveryItem } from "../delivery.types";

const item = (id: string, name = `Item ${id}`): DeliveryItem => ({ id, name, quantity: 1 });

const stopIds = () => useDeliveryStore.getState().stops.map((s) => s.id);

beforeEach(() => {
  useDeliveryStore.getState().resetDelivery();
});

describe("stops", () => {
  it("appends a stop and gives it an id", () => {
    useDeliveryStore.getState().addStop("12 Main St", "Corner Store", [], 17.4, 78.3);

    const [stop] = useDeliveryStore.getState().stops;
    expect(stop.address).toBe("12 Main St");
    expect(stop.storeName).toBe("Corner Store");
    expect(stop.lat).toBe(17.4);
    expect(stop.id).toBeTruthy();
  });

  it("gives every stop a distinct id", () => {
    useDeliveryStore.getState().addStop("A");
    useDeliveryStore.getState().addStop("B");

    const [a, b] = stopIds();
    expect(a).not.toBe(b);
  });

  it("removes only the named stop", () => {
    useDeliveryStore.getState().addStop("A");
    useDeliveryStore.getState().addStop("B");
    const [firstId] = stopIds();

    useDeliveryStore.getState().removeStop(firstId);

    expect(useDeliveryStore.getState().stops).toHaveLength(1);
    expect(useDeliveryStore.getState().stops[0].address).toBe("B");
  });

  it("reorderStops moves a stop from one index to another", () => {
    ["A", "B", "C"].forEach((a) => useDeliveryStore.getState().addStop(a));

    useDeliveryStore.getState().reorderStops(0, 2);

    expect(useDeliveryStore.getState().stops.map((s) => s.address)).toEqual(["B", "C", "A"]);
  });

  it("updateStop merges rather than replaces", () => {
    useDeliveryStore.getState().addStop("A", "Shop");
    const [id] = stopIds();

    useDeliveryStore.getState().updateStop(id, { address: "B" });

    expect(useDeliveryStore.getState().stops[0].address).toBe("B");
    expect(useDeliveryStore.getState().stops[0].storeName).toBe("Shop");
  });
});

describe("items on a stop", () => {
  it("adds and removes items on the right stop only", () => {
    useDeliveryStore.getState().addStop("A");
    useDeliveryStore.getState().addStop("B");
    const [aId, bId] = stopIds();

    useDeliveryStore.getState().addItemToStop(aId, item("1"));
    useDeliveryStore.getState().addItemToStop(bId, item("2"));
    useDeliveryStore.getState().removeItemFromStop(aId, "1");

    expect(useDeliveryStore.getState().stops[0].items).toHaveLength(0);
    expect(useDeliveryStore.getState().stops[1].items).toHaveLength(1);
  });
});

describe("pricing", () => {
  it("charges a base fee, a per-stop charge and a distance cost", () => {
    useDeliveryStore.getState().addStop("A");
    useDeliveryStore.getState().addStop("B");
    useDeliveryStore.getState().setRoute({ totalDistance: 10, estimatedTime: 40 });

    useDeliveryStore.getState().calculatePrice();

    const price = useDeliveryStore.getState().price!;
    expect(price.baseFee).toBe(2);
    expect(price.stopCharges).toBe(3); // 2 stops x 1.5
    expect(price.distanceCost).toBe(6); // 10km x 0.6
    expect(price.total).toBe(11);
  });

  it("falls back to a flat distance cost when no route has been calculated", () => {
    useDeliveryStore.getState().calculatePrice();

    expect(useDeliveryStore.getState().price!.distanceCost).toBe(4.5);
  });
});

describe("chat", () => {
  it("appends messages and counts unread independently", () => {
    useDeliveryStore.getState().addChatMessage({
      id: "m1", sender: "driver", text: "On my way", timestamp: "now",
    });
    useDeliveryStore.getState().incrementUnreadCount();
    useDeliveryStore.getState().incrementUnreadCount();

    expect(useDeliveryStore.getState().activeChat).toHaveLength(1);
    expect(useDeliveryStore.getState().unreadCount).toBe(2);
  });

  it("clearChat empties the thread and resets the unread badge", () => {
    useDeliveryStore.getState().addChatMessage({
      id: "m1", sender: "customer", text: "Hi", timestamp: "now",
    });
    useDeliveryStore.getState().incrementUnreadCount();

    useDeliveryStore.getState().clearChat();

    expect(useDeliveryStore.getState().activeChat).toHaveLength(0);
    expect(useDeliveryStore.getState().unreadCount).toBe(0);
  });
});

describe("resetDelivery", () => {
  it("clears stops and order state", () => {
    useDeliveryStore.getState().addStop("A");
    useDeliveryStore.getState().setOrderId("order-1");

    useDeliveryStore.getState().resetDelivery();

    expect(useDeliveryStore.getState().stops).toHaveLength(0);
    expect(useDeliveryStore.getState().currentOrderId).toBeNull();
  });
});
