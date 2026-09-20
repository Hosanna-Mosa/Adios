import { resolveNotificationTarget } from "../deepLink";

// Notification payloads come from the backend and from older, still-in-flight
// pushes, so this resolver is the boundary that has to cope with both shapes.

describe("resolveNotificationTarget", () => {
  it("uses the structured deepLink when present", () => {
    expect(
      resolveNotificationTarget({ deepLink: { screen: "/cart", params: { a: "1" } } }),
    ).toEqual({ screen: "/cart", params: { a: "1" } });
  });

  it("ignores notifications addressed to another app", () => {
    // SOS alerts are addressed to the admin web app, not this one.
    expect(resolveNotificationTarget({ deepLink: { screen: "/sos", app: "admin" } })).toBeNull();
  });

  it("accepts a deepLink explicitly addressed to the customer app", () => {
    expect(resolveNotificationTarget({ deepLink: { screen: "/cart", app: "customer" } }))
      .toEqual({ screen: "/cart", params: undefined });
  });

  it("falls back to the legacy orderId shape", () => {
    expect(resolveNotificationTarget({ orderId: 42 })).toEqual({
      screen: "/tracking",
      params: { orderId: "42" },
    });
  });

  it("prefers deepLink over a legacy orderId when both are present", () => {
    expect(resolveNotificationTarget({ deepLink: { screen: "/chat" }, orderId: 7 }))
      .toMatchObject({ screen: "/chat" });
  });

  it("returns null for payloads it cannot route", () => {
    expect(resolveNotificationTarget(null)).toBeNull();
    expect(resolveNotificationTarget(undefined)).toBeNull();
    expect(resolveNotificationTarget({})).toBeNull();
    expect(resolveNotificationTarget({ deepLink: "not-an-object" })).toBeNull();
    expect(resolveNotificationTarget({ deepLink: { params: { a: "1" } } })).toBeNull();
  });
});
