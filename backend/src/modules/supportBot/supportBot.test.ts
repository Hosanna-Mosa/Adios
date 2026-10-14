import { test } from "node:test";
import assert from "node:assert/strict";
import { ANSWER_TEMPLATES, renderAnswer, sub } from "./answers";
import { RESOLVERS, RESOLVER_DESCRIPTIONS, cancelReasonKey, normalizeStatus, runResolver, type OrderSnapshot, type ResolverContext } from "./resolvers";

const now = new Date("2026-01-01T10:00:00Z");
const order = (o: Partial<OrderSnapshot> = {}): OrderSnapshot => ({ id: "F123", status: "SEARCHING_DRIVER", serviceType: "bike", ...o });
const ctx = (o: OrderSnapshot | null, extra: Partial<ResolverContext> = {}): ResolverContext => ({
  order: o,
  payments: [],
  category: "ride",
  now,
  ...extra,
});
const answer = (key: string, c: ResolverContext, lang: "en" | "te" | "hi" = "en") => renderAnswer(lang, runResolver(key, c));

test("normalizeStatus folds upper and lower case statuses onto one stage", () => {
  assert.equal(normalizeStatus("SEARCHING_DRIVER"), "searching");
  assert.equal(normalizeStatus("DRIVER_ASSIGNED"), "assigned");
  assert.equal(normalizeStatus("driver_assigned"), "assigned");
  assert.equal(normalizeStatus("en_route_delivery"), "onTheWay");
  assert.equal(normalizeStatus("IN_TRANSIT"), "onTheWay");
  assert.equal(normalizeStatus("delivered"), "delivered");
  assert.equal(normalizeStatus("COMPLETED"), "delivered");
  assert.equal(normalizeStatus("CANCELLED"), "cancelled");
  assert.equal(normalizeStatus("whatever"), "unknown");
});

test("cancel reasons map to their own answers", () => {
  assert.equal(cancelReasonKey({ cancelReason: "restaurant_timeout", serviceType: "bike" }), "cancelRestaurantTimeout");
  assert.equal(cancelReasonKey({ cancelReason: "driver_cancelled", serviceType: "bike" }), "cancelDriver");
  assert.equal(cancelReasonKey({ serviceType: "helper", searchExhaustedAt: now }), "cancelNoHelpers");
  assert.equal(cancelReasonKey({ serviceType: "bike", dispatch: { failureReason: "no_drivers" } }), "cancelNoDriver");
  assert.equal(cancelReasonKey({ serviceType: "bike" }), "cancelUnknown");
});

test("a cancelled online order explains the reason and the refund", () => {
  const text = answer(
    "whyCancelled",
    ctx(order({ status: "CANCELLED", cancelReason: "restaurant_rejected", paymentMethod: "online", refundStatus: "pending", refundAmount: 250 }))
  );
  assert.match(text, /restaurant couldn't take your order/);
  assert.match(text, /refund of ₹250/);
});

test("a cash order has nothing to refund, and an active order isn't called cancelled", () => {
  assert.match(answer("refundStatus", ctx(order({ status: "CANCELLED", paymentMethod: "cash" }))), /cash on delivery/);
  assert.match(answer("whyCancelled", ctx(order())), /not cancelled/);
});

test("no matching order gives the friendly message, but order-less questions still work", () => {
  assert.match(answer("orderStatus", ctx(null)), /couldn't find a recent ride order/);
  assert.match(answer("paymentIssue", ctx(null)), /don't see any failed or pending payments/);
});

test("driver search reports how long it has been going", () => {
  const text = answer("driverAssignment", ctx(order({ dispatch: { startedAt: new Date("2026-01-01T09:50:00Z"), attempts: 4 } })));
  assert.match(text, /10 min/);
  assert.match(text, /4 drivers asked/);
});

test("payments: flagged and stuck payments are explained", () => {
  assert.match(
    answer("paymentIssue", ctx(null, { payments: [{ status: "flagged", purpose: "order", amountPaise: 12000, hasOrder: false }] })),
    /₹120.*reviewed/
  );
  assert.match(
    answer("paymentIssue", ctx(null, { payments: [{ status: "created", purpose: "order", amountPaise: 5000, hasOrder: false, createdAt: new Date("2026-01-01T09:00:00Z") }] })),
    /₹50.*not completed/
  );
});

test("fare breakdown shows surge and discount only when they apply", () => {
  const plain = answer("fareBreakdown", ctx(order({ priceBreakdown: { baseFare: 30, distanceFare: 50, timeFare: 10, surgeMultiplier: 1 }, totalPrice: 90 })));
  assert.equal(plain, "Fare for #F123: base ₹30 + distance ₹50 + time ₹10. Total: ₹90.");
  const surged = answer("fareBreakdown", ctx(order({ priceBreakdown: { baseFare: 30, distanceFare: 50, timeFare: 10, surgeMultiplier: 1.5 }, discountAmount: 20, totalPrice: 120 })));
  assert.match(surged, /x1.5 surge/);
  assert.match(surged, /minus ₹20 discount/);
});

test("the helper answers never contain the start OTP or completion PIN", () => {
  const withCodes = { ...order({ serviceType: "helper", status: "IN_PROGRESS", driverName: "Ravi" }), restaurantPickupCode: "4821", deliveryOtp: "9137" } as OrderSnapshot;
  for (const status of ["SEARCHING_DRIVER", "DRIVER_ASSIGNED", "IN_PROGRESS", "DELIVERED", "CANCELLED"]) {
    for (const lang of ["en", "te", "hi"] as const) {
      const text = answer("helperTask", ctx({ ...withCodes, status }, { category: "helper" }), lang);
      assert.ok(text && !text.includes("4821") && !text.includes("9137"), `${status}/${lang}`);
    }
  }
});

test("static answers use the admin text and fall back when empty", () => {
  assert.equal(answer("static", ctx(null, { staticAnswer: "Open Profile → Language." })), "Open Profile → Language.");
  assert.match(answer("static", ctx(null)), /talk to an agent/i);
});

test("every fragment has en, te and hi text with the same placeholders", () => {
  const placeholders = (s: string) => (s.match(/\{\w+\}/g) || []).sort().join(",");
  for (const [key, template] of Object.entries(ANSWER_TEMPLATES)) {
    for (const lang of ["en", "te", "hi"] as const) {
      assert.ok(template[lang]?.trim(), `${key}.${lang} is empty`);
      assert.equal(placeholders(template[lang]), placeholders(template.en), `${key}.${lang} placeholders differ`);
    }
  }
});

test("every resolver has a description, and every key an answer template exists for what resolvers emit", () => {
  assert.deepEqual(Object.keys(RESOLVERS).sort(), Object.keys(RESOLVER_DESCRIPTIONS).sort());
  const samples: ResolverContext[] = [
    ctx(order()),
    ctx(order({ status: "CANCELLED", cancelReason: "admin_cancelled", paymentMethod: "online", refundStatus: "processed" })),
    ctx(order({ scheduledFor: now, scheduleStatus: "rejected", scheduleRejectionReason: "closed" })),
    ctx(null),
  ];
  for (const key of Object.keys(RESOLVERS)) {
    for (const c of samples) {
      for (const part of runResolver(key, c)) {
        assert.ok(part.key === "__static" || ANSWER_TEMPLATES[part.key], `${key} emitted unknown fragment ${part.key}`);
      }
    }
  }
});

test("nested fragments render in the customer's language", () => {
  const parts = [{ key: "refundPending", params: { amount: "99", since: sub("since", { date: "1 Jan" }) } }];
  assert.match(renderAnswer("en", parts), /started on 1 Jan/);
  assert.match(renderAnswer("hi", parts), /1 Jan को/);
});
