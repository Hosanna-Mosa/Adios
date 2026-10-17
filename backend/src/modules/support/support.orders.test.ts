import { test } from "node:test";
import assert from "node:assert/strict";
import { kindFilter, maskPhone, parseSearchTerm, statusGroupFilter, supportOrderKind, toSupportOrderRow, toSupportOrderView } from "./support.orders.view";

const baseOrder = (o: Record<string, any> = {}) => ({
  _id: "ADSF161026123456",
  status: "DELIVERED",
  serviceType: "delivery",
  vendor: "64b000000000000000000001",
  user: { _id: "64a000000000000000000001", name: "Asha", phone: "+919876543210", password: "hash", addresses: [{ addressLine: "x" }] },
  driver: { _id: "64c000000000000000000001", vehicleType: "bike", bankAccountNumber: "1234", user: { _id: "u", name: "Ravi", phone: "9123456789" } },
  totalPrice: 250,
  paymentMethod: "online",
  paymentStatus: "paid",
  deliveryOtp: "4821",
  restaurantPickupCode: "7712",
  razorpayRefundId: "rfnd_123",
  stops: [
    { sequence: 1, type: "pickup", address: "Outlet", location: { coordinates: [81.8, 17] }, items: { lines: [{ name: "Biryani", quantity: 2, price: 120 }] } },
    { sequence: 2, type: "drop", address: "Home", location: { coordinates: [81.9, 17.1] }, items: { lines: [], instructions: "Ring twice" } },
  ],
  createdAt: new Date("2026-10-16T10:00:00Z"),
  updatedAt: new Date("2026-10-16T10:40:00Z"),
  ...o,
});

test("maskPhone keeps two leading and three trailing digits of the national number", () => {
  assert.equal(maskPhone("9876543210"), "98xxxxx210");
  assert.equal(maskPhone("+91 98765 43210"), "98xxxxx210");
  assert.equal(maskPhone("09876543210"), "98xxxxx210");
  assert.equal(maskPhone("12345"), "xxxxx");
  assert.equal(maskPhone(""), null);
  assert.equal(maskPhone(undefined), null);
});

test("the support view never carries handover codes, raw phones or unrelated personal data", () => {
  const view = toSupportOrderView(baseOrder(), { items: [{ name: "Biryani", quantity: 2, price: 120, id: "x" }] });
  const json = JSON.stringify(view);
  for (const secret of ["4821", "7712", "rfnd_123", "9876543210", "9123456789", "hash", "addressLine", "1234\""]) {
    assert.ok(!json.includes(secret), `view leaked ${secret}`);
  }
  assert.equal(view.customer.phone, "98xxxxx210");
  assert.equal(view.driver?.phone, "91xxxxx789");
  assert.equal(view.driver?.name, "Ravi");
  assert.equal(view.stops[1].instructions, "Ring twice");
  assert.deepEqual(view.items, [{ name: "Biryani", quantity: 2, price: 120 }]);
  assert.equal(view.refund, null);
});

test("package delivery contacts and booking-for numbers are masked too", () => {
  const view = toSupportOrderView(
    baseOrder({
      serviceType: "bike",
      vendor: undefined,
      bookingFor: { type: "someone_else", contactNumber: "9000011111" },
      packageDelivery: { payAt: "drop", pickupContact: { name: "A", phone: "9000022222" }, dropContact: { name: "B", phone: "9000033333" } },
    })
  );
  assert.equal(view.kind, "packageDelivery");
  assert.equal(view.bookingFor?.contactNumber, "90xxxxx111");
  assert.equal(view.packageDelivery?.pickupContact?.phone, "90xxxxx222");
  assert.equal(view.packageDelivery?.dropContact?.phone, "90xxxxx333");
});

test("refund details appear once a refund was requested", () => {
  const view = toSupportOrderView(baseOrder({ status: "CANCELLED", refundStatus: "pending", refundAmount: 250, cancelReason: "restaurant_rejected" }));
  assert.equal(view.refund?.status, "pending");
  assert.equal(view.refund?.amount, 250);
  assert.equal(view.cancelReason, "restaurant_rejected");
});

test("search rows mask the customer phone", () => {
  const row = toSupportOrderRow(baseOrder(), { _id: "v", name: "Spice Hut", partnerType: "food" });
  assert.equal(row.customer?.phone, "98xxxxx210");
  assert.equal(row.outletName, "Spice Hut");
  assert.equal(row.from, "Outlet");
  assert.equal(row.to, "Home");
});

test("order kinds follow the admin panel's rules", () => {
  assert.equal(supportOrderKind({ serviceType: "bike", packageDelivery: { payAt: "drop" } }), "packageDelivery");
  assert.equal(supportOrderKind({ serviceType: "cab_prime" }), "ride");
  assert.equal(supportOrderKind({ serviceType: "helper" }), "helper");
  assert.equal(supportOrderKind({ serviceType: "delivery", vendor: "x" }), "food");
  assert.equal(supportOrderKind({ serviceType: "delivery" }), "courier");
  assert.deepEqual(kindFilter("helper"), { serviceType: "helper", packageDelivery: null });
  assert.deepEqual(statusGroupFilter("cancelled"), { status: { $in: ["CANCELLED", "cancelled"] } });
});

test("the search box reads order ids, phone numbers and names", () => {
  assert.deepEqual(parseSearchTerm("#adsf161026123456"), { orderIdPattern: "ADSF161026123456", phoneDigits: null, namePattern: "adsf161026123456" });
  assert.deepEqual(parseSearchTerm("+91 98765 43210"), { orderIdPattern: null, phoneDigits: "9876543210", namePattern: null });
  assert.deepEqual(parseSearchTerm("123456"), { orderIdPattern: "123456", phoneDigits: "123456", namePattern: null });
  assert.deepEqual(parseSearchTerm("Asha K"), { orderIdPattern: null, phoneDigits: null, namePattern: "Asha K" });
  assert.equal(parseSearchTerm("a.*").namePattern, "a\\.\\*");
  assert.deepEqual(parseSearchTerm("  "), { orderIdPattern: null, phoneDigits: null, namePattern: null });
});
