import { isMeatOrder, isOutletOrder, outletKey } from "../orderStops";

describe("outlet orders", () => {
  it("an order with an outlet is an outlet order (no delivery OTP, pickup waits for ready)", () => {
    expect(isOutletOrder({ hasOutlet: true })).toBe(true);
    expect(isOutletOrder({ vendorName: "Spice Hut" })).toBe(true);
    expect(isOutletOrder({ serviceType: "bike" })).toBe(false);
  });

  it("a meat order is worded as a meat shop, a restaurant order as a restaurant", () => {
    const meat = { outletKind: "meat" };
    const food = { outletKind: "food" };
    expect(isMeatOrder(meat)).toBe(true);
    expect(outletKey(meat, "jobs.arrivedAtRestaurant")).toBe("jobs.arrivedAtMeatShop");
    expect(outletKey(meat, "jobs.startTravelToRestaurant")).toBe("jobs.startTravelToMeatShop");
    expect(outletKey(meat, "jobs.restaurantPickupCode")).toBe("jobs.meatShopPickupCode");
    expect(outletKey(food, "jobs.arrivedAtRestaurant")).toBe("jobs.arrivedAtRestaurant");
    expect(outletKey(null, "jobs.arrivedAtRestaurant")).toBe("jobs.arrivedAtRestaurant");
  });

  it("keys with no meat-shop wording stay as they are", () => {
    expect(outletKey({ outletKind: "meat" }, "jobs.verifyAndPickUp")).toBe("jobs.verifyAndPickUp");
  });
});
