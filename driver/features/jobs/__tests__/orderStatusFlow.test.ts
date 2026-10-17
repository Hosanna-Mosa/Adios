jest.mock("@/i18n", () => ({ __esModule: true, default: { t: (k: string) => k } }));

import { otpMatches, runPickupLeg } from "../hooks/orderStatusFlow";

// The pickup leg every ride and outlet delivery runs: travel → arrive → pickup code.

describe("otpMatches", () => {
  it("accepts only the order's own code, case-insensitively", () => {
    expect(otpMatches("4821", "4821", "3456")).toBe(true);
    expect(otpMatches("ab12", "AB12", "3456")).toBe(true);
    expect(otpMatches("0000", "4821", "3456")).toBe(false);
  });

  it("falls back to the last 4 of the order id only when the order has no code", () => {
    expect(otpMatches("3456", undefined, "3456")).toBe(true);
    expect(otpMatches("3456", "4821", "3456")).toBe(false);
  });
});

describe("runPickupLeg", () => {
  const order = (o: Record<string, any> = {}) => ({ id: "ADSR161026123456", restaurantPickupCode: "4821", ...o });

  const ctx = (o: Record<string, any> = {}) => ({
    currentOrder: order(),
    updateOrderStatus: jest.fn().mockResolvedValue(undefined),
    restaurantOTP: "",
    setRestaurantOTPError: jest.fn(),
    stopSimulation: jest.fn(),
    ...o,
  });

  it("accepted → on the way to pickup", async () => {
    const c = ctx();
    expect(await runPickupLeg("accepted", c)).toBe(true);
    expect(c.updateOrderStatus).toHaveBeenCalledWith("en_route_pickup");
  });

  it("on the way → arrived at pickup", async () => {
    const c = ctx();
    expect(await runPickupLeg("en_route_pickup", c)).toBe(true);
    expect(c.stopSimulation).toHaveBeenCalled();
    expect(c.updateOrderStatus).toHaveBeenCalledWith("arrived_pickup");
  });

  it("a wrong pickup code stops at pickup and shows the error", async () => {
    const c = ctx({ restaurantOTP: "0000" });
    expect(await runPickupLeg("arrived_pickup", c)).toBe(true);
    expect(c.setRestaurantOTPError).toHaveBeenCalledWith(true);
    expect(c.updateOrderStatus).not.toHaveBeenCalled();
  });

  it("the right pickup code starts the delivery leg and sends the code to the server", async () => {
    const c = ctx({ restaurantOTP: "4821" });
    expect(await runPickupLeg("arrived_pickup", c)).toBe(true);
    expect(c.setRestaurantOTPError).toHaveBeenCalledWith(false);
    expect(c.updateOrderStatus).toHaveBeenCalledWith("en_route_delivery", "4821");
  });

  it("a package delivery starts without a code", async () => {
    const c = ctx({ currentOrder: order({ packageDelivery: { payAt: "drop" } }) });
    expect(await runPickupLeg("arrived_pickup", c)).toBe(true);
    expect(c.updateOrderStatus).toHaveBeenCalledWith("en_route_delivery");
  });

  it("on the way to drop → arrived at drop", async () => {
    const c = ctx();
    expect(await runPickupLeg("en_route_delivery", c)).toBe(true);
    expect(c.updateOrderStatus).toHaveBeenCalledWith("arrived_delivery");
  });

  it("stages after the pickup leg are left to the caller", async () => {
    const c = ctx();
    expect(await runPickupLeg("arrived_delivery", c)).toBe(false);
    expect(c.updateOrderStatus).not.toHaveBeenCalled();
  });
});
