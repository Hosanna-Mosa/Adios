jest.mock("@/i18n", () => ({ __esModule: true, default: { t: (k: string) => k } }));

import { pickupApproach } from "../utils/offer";

describe("pickupApproach", () => {
  const stops = [
    { type: "pickup", lat: 17.01, lng: 81.79 },
    { type: "delivery", lat: 17.1, lng: 81.8 },
  ];

  it("measures from the driver to the pickup, not the trip", () => {
    // ~11 km south of the pickup → ~11 km, ~30 min at 22 km/h.
    const approach = pickupApproach({ lat: 16.91, lng: 81.79 }, stops)!;
    expect(approach.km).toBeGreaterThan(10.5);
    expect(approach.km).toBeLessThan(11.5);
    expect(approach.minutes).toBeGreaterThanOrEqual(29);
    expect(approach.minutes).toBeLessThanOrEqual(31);
  });

  it("a driver at the pickup is at least a minute away, never zero", () => {
    expect(pickupApproach({ lat: 17.01, lng: 81.79 }, stops)).toEqual({ km: 0, minutes: 1 });
  });

  it("no position or no pickup point gives nothing to show", () => {
    expect(pickupApproach(null, stops)).toBeNull();
    expect(pickupApproach({ lat: 17, lng: 81.8 }, [])).toBeNull();
  });
});
