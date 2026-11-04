import { STATUS_ORDER, calculateBearing, calculateDynamicETA, normalizeStatus } from "../useTracking.shared";

// Order tracking: how the backend's statuses map onto the tracking timeline, and the
// live ETA and heading the map shows.

describe("normalizeStatus", () => {
  it.each([
    ["CREATED", "confirmed"],
    ["SEARCHING_DRIVER", "confirmed"],
    ["DRIVER_ASSIGNED", "driver_assigned"],
    ["driver_assigned", "driver_assigned"],
    ["ON_THE_WAY", "en_route_pickup"],
    ["en_route_pickup", "en_route_pickup"],
    ["ARRIVED_PICKUP", "arrived_pickup"],
    ["PICKING_ITEMS", "picking_items"],
    ["IN_TRANSIT", "en_route_delivery"],
    ["en_route_delivery", "en_route_delivery"],
    ["IN_PROGRESS", "en_route_delivery"],
    ["arrived_delivery", "arrived_delivery"],
    ["DELIVERED", "delivered"],
    ["COMPLETED", "delivered"],
    ["CANCELLED", "cancelled"],
  ])("%s → %s", (backend, expected) => {
    expect(normalizeStatus(backend)).toBe(expected);
  });

  it("an unknown status falls back to confirmed instead of crashing the timeline", () => {
    expect(normalizeStatus("SOMETHING_NEW")).toBe("confirmed");
  });

  it("every mapped status except cancelled has a place on the timeline, in order", () => {
    const journey = ["CREATED", "DRIVER_ASSIGNED", "ON_THE_WAY", "ARRIVED_PICKUP", "PICKING_ITEMS", "IN_TRANSIT", "arrived_delivery", "DELIVERED"];
    const positions = journey.map((s) => STATUS_ORDER.indexOf(normalizeStatus(s)));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });
});

describe("calculateDynamicETA", () => {
  const pickup = { lat: 17.0, lng: 81.8 };

  it("uses the server's ETA until both points are known", () => {
    expect(calculateDynamicETA(null, pickup, 12)).toBe(12);
    expect(calculateDynamicETA(pickup, null, 12)).toBe(12);
  });

  it("estimates from distance at ~22 km/h", () => {
    // ~11.1 km due north → ~30 minutes.
    const eta = calculateDynamicETA({ lat: 17.0, lng: 81.8 }, { lat: 17.1, lng: 81.8 }, null);
    expect(eta).toBeGreaterThanOrEqual(29);
    expect(eta).toBeLessThanOrEqual(31);
  });

  it("never shows less than a minute", () => {
    expect(calculateDynamicETA(pickup, { lat: 17.00001, lng: 81.8 }, null)).toBe(1);
  });
});

describe("calculateBearing", () => {
  it.each([
    [17.1, 81.8, 0],
    [17.0, 81.9, 90],
    [16.9, 81.8, 180],
    [17.0, 81.7, 270],
  ])("towards (%s, %s) is about %s°", (lat, lng, expected) => {
    const bearing = calculateBearing(17.0, 81.8, lat, lng);
    const diff = Math.min(Math.abs(bearing - expected), 360 - Math.abs(bearing - expected));
    expect(diff).toBeLessThan(1);
  });
});
