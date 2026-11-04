jest.mock("@/i18n", () => ({ __esModule: true, default: { t: (k: string) => k } }));

import { mapApiOrder, paymentFields } from "../orderMapper";

const apiOrder = (o: Record<string, any> = {}) => ({
  _id: "ADSF161026123456",
  serviceType: "delivery",
  status: "driver_assigned",
  totalPrice: 349,
  totalDistance: 4.2,
  duration: 18,
  createdAt: "2026-10-16T10:00:00Z",
  user: { name: "Asha", phone: "9876543210" },
  stops: [
    { _id: "s1", type: "PICKUP", address: "Spice Hut, Main Rd", location: { coordinates: [81.79, 17.01] } },
    { _id: "s2", type: "DROP", address: "12 MG Road, Rajahmundry", location: { coordinates: [81.8, 17.0] } },
  ],
  ...o,
});

describe("paymentFields", () => {
  it("only a captured online payment counts as online", () => {
    expect(paymentFields({ paymentMethod: "online", paymentStatus: "paid", totalPrice: 100 }).paymentMethod).toBe("online");
    // Online but not captured: the driver must treat it as cash.
    expect(paymentFields({ paymentMethod: "online", paymentStatus: "pending", totalPrice: 100 }).paymentMethod).toBe("cash");
    expect(paymentFields({ paymentMethod: "cash", totalPrice: 100 }).paymentMethod).toBe("cash");
  });

  it("the amount to collect is the server's payableAmount, else the total, rounded", () => {
    expect(paymentFields({ payableAmount: 57.6 }).payableAmount).toBe(58);
    expect(paymentFields({ totalPrice: 349.2 }).payableAmount).toBe(349);
  });
});

describe("mapApiOrder", () => {
  it("maps the order the driver works from", () => {
    const order = mapApiOrder(apiOrder());
    expect(order).toMatchObject({
      id: "ADSF161026123456",
      earnings: 279, // the driver's 80% share
      customerName: "Asha",
      distance: "4.2 km",
      duration: "18 min",
    });
    expect(order.stops.map((s) => s.type)).toEqual(["pickup", "delivery"]);
    expect(order.stops[0]).toMatchObject({ lat: 17.01, lng: 81.79, locationName: "Spice Hut" });
  });

  it("keeps the outlet kind from the offer, or reads it from the outlet", () => {
    expect(mapApiOrder(apiOrder({ outletKind: "meat" })).outletKind).toBe("meat");
    expect(mapApiOrder(apiOrder({ vendor: { _id: "v", name: "Fresh Cuts", partnerType: "meat" } })).outletKind).toBe("meat");
    expect(mapApiOrder(apiOrder({ vendor: { _id: "v", name: "Spice Hut", partnerType: "food" } })).outletKind).toBe("food");
    // A status update's answer may not carry it: the offer's value survives through the fallback.
    expect(mapApiOrder(apiOrder(), { outletKind: "meat" } as any).outletKind).toBe("meat");
  });

  it("keeps a package delivery a package delivery across updates", () => {
    const pkg = { payAt: "drop" };
    expect(mapApiOrder(apiOrder({ packageDelivery: pkg })).packageDelivery).toEqual(pkg);
    expect(mapApiOrder(apiOrder(), { packageDelivery: pkg } as any).packageDelivery).toEqual(pkg);
  });

  it("falls back to the offer's customer details when the update omits them", () => {
    const order = mapApiOrder(apiOrder({ user: undefined }), { customerName: "Ravi", customerPhone: "9000000000" } as any);
    expect(order.customerName).toBe("Ravi");
    expect(order.customerPhone).toBe("9000000000");
  });
});
