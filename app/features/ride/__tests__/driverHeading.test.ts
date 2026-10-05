import { nextDriverLocation } from "../useTracking.shared";

// ~0.00009° of latitude is ~10 m.
const LAT = 17.4935;
const LNG = 78.4555;

describe("nextDriverLocation", () => {
  it("starts from the reported compass heading before there is any movement", () => {
    expect(nextDriverLocation(null, LAT, LNG, 90).heading).toBe(90);
  });

  it("ignores GPS wobble of a few metres", () => {
    const start = { ...nextDriverLocation(null, LAT, LNG, 0), heading: 0 };
    const wobble = nextDriverLocation(start, LAT - 0.00002, LNG + 0.00001, 200);
    expect(wobble.heading).toBe(0);
  });

  it("turns to the direction travelled once the rider has moved 10 m or more", () => {
    const start = nextDriverLocation(null, LAT, LNG, 0);
    const east = nextDriverLocation(start, LAT, LNG + 0.0002); // ~21 m east
    expect(Math.round(east.heading)).toBe(90);
  });

  it("adds up small steps from the last turn point, so slow riding still turns", () => {
    let loc = nextDriverLocation(null, LAT, LNG, 0);
    for (let i = 1; i <= 4; i++) loc = nextDriverLocation(loc, LAT - 0.00003 * i, LNG); // 4 × ~3 m south
    expect(Math.round(loc.heading)).toBe(180);
  });
});
