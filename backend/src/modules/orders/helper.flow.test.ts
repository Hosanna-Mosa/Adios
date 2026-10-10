import { test } from "node:test";
import assert from "node:assert/strict";
import { assertHelperTransition, withoutCustomerCodes } from "./helper.flow";

test("the normal path is allowed", () => {
  assertHelperTransition("DRIVER_ASSIGNED", "IN_PROGRESS", "driver");
  assertHelperTransition("IN_PROGRESS", "delivered", "driver");
  assertHelperTransition("SEARCHING_DRIVER", "CANCELLED", "customer");
  assertHelperTransition("DRIVER_ASSIGNED", "CANCELLED", "customer");
});

test("a task can't be completed before it starts", () => {
  assert.throws(() => assertHelperTransition("DRIVER_ASSIGNED", "delivered", "driver"), /start OTP/);
});

test("a started task can't be cancelled, except by staff", () => {
  assert.throws(() => assertHelperTransition("IN_PROGRESS", "CANCELLED", "customer"), /already started/);
  assertHelperTransition("IN_PROGRESS", "CANCELLED", "staff");
});

test("ride/delivery statuses don't apply", () => {
  assert.throws(() => assertHelperTransition("DRIVER_ASSIGNED", "en_route_delivery", "driver"));
});

test("repeating the current status is a no-op", () => {
  assertHelperTransition("IN_PROGRESS", "in_progress", "driver");
});

test("codes are removed from helper orders only", () => {
  const helper = withoutCustomerCodes({ serviceType: "helper", deliveryOtp: "1234", restaurantPickupCode: "5678", x: 1 });
  assert.deepEqual(helper, { serviceType: "helper", x: 1 });
  const ride = withoutCustomerCodes({ serviceType: "cab", deliveryOtp: "1234" });
  assert.equal(ride.deliveryOtp, "1234");
});
