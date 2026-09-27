// These guard the one thing the service extraction could silently break: the
// exact URL, method and body sent to the server. customFetch is stubbed so the
// assertions are about the request, not the response.

// jest.mock factories may only close over names beginning with "mock".
const mockCustomFetch = jest.fn(() => Promise.resolve({}));
jest.mock("@/utils/api/custom-fetch", () => ({
  customFetch: (...args: any[]) => mockCustomFetch(...(args as [])),
}));

jest.mock("expo-linking", () => ({ createURL: (path: string) => `flavour://${path}` }));
jest.mock("@/i18n", () => ({ __esModule: true, default: { language: "te" } }));

import * as catalog from "../catalog.service";
import * as cart from "../cart.service";
import * as notifications from "../notifications.service";
import * as orders from "../orders.service";
import * as payments from "../payments.service";
import * as places from "../places.service";
import * as users from "../users.service";

beforeEach(() => mockCustomFetch.mockClear());

const lastCall = () => mockCustomFetch.mock.calls[0] as unknown as [string, any?];

describe("catalog", () => {
  it("builds the nearby-vendors URL with paging and passes extra params through verbatim", () => {
    catalog.getNearbyVendors(17.4, 78.3, 2, "&radius=5000&veg=true");

    expect(lastCall()[0]).toBe("/vendors/nearby?lat=17.4&lng=78.3&page=2&limit=20&radius=5000&veg=true");
  });

  it("defaults extra params to nothing rather than 'undefined'", () => {
    catalog.getNearbyMeatCentres(1, 2, 1);

    expect(lastCall()[0]).toBe("/meat/nearby?lat=1&lng=2&page=1&limit=20");
  });

  it("url-encodes a dish search term", () => {
    catalog.searchDishes("chicken 65");

    expect(lastCall()[0]).toBe("/food/search?query=chicken%2065");
  });
});

describe("orders", () => {
  it("cancels by setting the CANCELLED status", () => {
    orders.cancelOrder("o1");

    const [url, opts] = lastCall();
    expect(url).toBe("/orders/o1/status");
    expect(opts.method).toBe("PATCH");
    expect(JSON.parse(opts.body)).toEqual({ status: "CANCELLED" });
  });

  it("posts the order body unchanged", () => {
    orders.createOrder({ serviceType: "ride", stops: [] });

    const [url, opts] = lastCall();
    expect(url).toBe("/orders");
    expect(JSON.parse(opts.body)).toEqual({ serviceType: "ride", stops: [] });
  });

  it("reorder is a POST that returns a cart", () => {
    orders.reorder("o1");
    expect(lastCall()).toEqual(["/orders/o1/reorder", { method: "POST" }]);
  });
});

describe("places", () => {
  it("encodes the autocomplete input and appends the location bias", () => {
    places.searchPlaces("MG Road", "&lat=1&lng=2");

    expect(lastCall()[0]).toBe("/places/autocomplete?input=MG%20Road&lat=1&lng=2");
  });

  it("optimizeRoute keeps the explicit json responseType the callers relied on", () => {
    places.optimizeRoute({ origin: {} });

    expect(lastCall()[1].responseType).toBe("json");
  });
});

describe("payments", () => {
  it("sends the amount, what is being bought, the return link and the language", () => {
    payments.createPaymentOrder(325, { vendorId: "v1" });

    expect(JSON.parse(lastCall()[1].body)).toEqual({
      amount: 325,
      orderData: { vendorId: "v1" },
      returnUrl: "flavour://payment-result",
      language: "te",
    });
  });

  it("asks the checkout status by Razorpay order id", () => {
    payments.getCheckoutStatus("order_ABC");

    expect(lastCall()[0]).toBe("/payments/checkout-status/order_ABC");
  });
});

describe("users", () => {
  it("uploads the profile picture as form data, not JSON", () => {
    const form = new FormData();
    users.uploadProfilePicture(form);

    const [url, opts] = lastCall();
    expect(url).toBe("/users/profile-pic");
    expect(opts.isFormData).toBe(true);
    expect(opts.body).toBe(form);
  });

  it("all three address writes hit the right verb", () => {
    users.createAddress({});
    expect(lastCall()[1].method).toBe("POST");
    mockCustomFetch.mockClear();

    users.updateAddress("a1", {});
    expect(lastCall()).toMatchObject(["/users/addresses/a1", { method: "PATCH" }]);
    mockCustomFetch.mockClear();

    users.deleteAddress("a1");
    expect(lastCall()).toMatchObject(["/users/addresses/a1", { method: "DELETE" }]);
  });
});

describe("cart", () => {
  it("carries the caller's headers so a sign-out write keeps its credentials", () => {
    const headers = { authorization: "Bearer old-token" };
    cart.clearRemoteCart(headers);

    expect(lastCall()).toEqual(["/cart", { method: "DELETE", headers }]);
  });
});

describe("notifications", () => {
  it("marks one and all as read with PATCH", () => {
    notifications.markNotificationRead("n1");
    expect(lastCall()).toEqual(["/notifications/n1/read", { method: "PATCH" }]);
    mockCustomFetch.mockClear();

    notifications.markAllNotificationsRead();
    expect(lastCall()).toEqual(["/notifications/read-all", { method: "PATCH" }]);
  });
});
