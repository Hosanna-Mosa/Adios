import { foodStageOf, nextFoodStage } from "../useTracking.shared";

describe("food order stage before a delivery partner is assigned", () => {
  const food = (overrides: Record<string, unknown> = {}) => ({ dispatchMode: "broadcast", status: "CREATED", ...overrides });

  it("is 'waiting for the restaurant' until the restaurant accepts", () => {
    expect(foodStageOf(food())).toBe("awaiting_restaurant");
    expect(foodStageOf(food({ status: "SEARCHING_DRIVER", restaurantAcceptedAt: "2026-10-04T09:01:00Z" }))).toBe("preparing");
    expect(foodStageOf(food({ status: "DRIVER_ASSIGNED" }))).toBeNull();
  });

  it("never applies to rides, meat or older orders", () => {
    expect(foodStageOf({ status: "CREATED" })).toBeNull();
    expect(foodStageOf({ status: "SEARCHING_DRIVER", dispatchMode: "sequential" })).toBeNull();
  });

  it("moves on from live status updates alone", () => {
    expect(nextFoodStage("awaiting_restaurant", "CREATED")).toBe("awaiting_restaurant");
    expect(nextFoodStage("awaiting_restaurant", "SEARCHING_DRIVER")).toBe("preparing");
    expect(nextFoodStage("preparing", "driver_assigned")).toBeNull();
    expect(nextFoodStage(null, "SEARCHING_DRIVER")).toBeNull();
  });
});
