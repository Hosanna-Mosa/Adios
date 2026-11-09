import { test } from "node:test";
import assert from "node:assert/strict";
import { Types } from "mongoose";

import { escapeForHtml, escapeHtml } from "../utils/html";
import { InvoiceService } from "./invoice.service";
import { ServiceType, StopType } from "../database/models/Order";

const PAYLOAD = `<img src=x onerror="alert(1)">`;

const order = (serviceType: ServiceType) => ({
  _id: "222972423858594",
  createdAt: new Date("2025-11-24T20:30:00"),
  paymentMethod: "Online (Razorpay)",
  totalPrice: 998.76,
  serviceType,
  user: { name: PAYLOAD, phone: "+91 9876543210" },
  vendor: { name: PAYLOAD, address: PAYLOAD, legal: { fssaiNumber: "13619013001824", gstin: PAYLOAD } },
  driver: { vehicleNumber: PAYLOAD, user: { name: PAYLOAD } },
  stops: [
    { sequence: 1, type: StopType.PICKUP, address: PAYLOAD, location: { type: "Point", coordinates: [78.38, 17.44] } },
    {
      sequence: 2,
      type: StopType.DROP,
      address: PAYLOAD,
      location: { type: "Point", coordinates: [78.34, 17.44] },
      items: {
        lines: [{ name: PAYLOAD, quantity: 1, price: 599, total: 599 }],
        totals: { subtotal: 599, taxes: 0, deliveryFee: 0, serviceFee: 0, tip: 0, discount: 0, total: 599 },
      },
    },
  ],
});

test("escapeHtml neutralises markup characters", () => {
  assert.equal(escapeHtml(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  assert.equal(escapeHtml(undefined), "");
});

test("escapeForHtml escapes nested strings and leaves Dates, ObjectIds and numbers alone", () => {
  const id = new Types.ObjectId();
  const when = new Date("2025-01-01");
  const out = escapeForHtml({ id, when, n: 5, list: ["<b>"], nested: { s: "<i>" } });
  assert.equal(out.id, id);
  assert.equal(out.when, when);
  assert.equal(out.n, 5);
  assert.deepEqual(out.list, ["&lt;b&gt;"]);
  assert.equal(out.nested.s, "&lt;i&gt;");
});

for (const [label, render, type] of [
  ["delivery invoice", "generateDeliveryInvoiceHtml", ServiceType.DELIVERY],
  ["delivery email", "generateDeliveryEmailHtml", ServiceType.DELIVERY],
  ["ride invoice", "generateRideInvoiceHtml", ServiceType.CAB],
  ["ride email", "generateRideEmailHtml", ServiceType.CAB],
] as const) {
  test(`${label}: user-typed fields render as text, not markup`, () => {
    const html = (InvoiceService.getInstance() as any)[render](order(type)) as string;
    assert.equal(html.includes(PAYLOAD), false);
    assert.equal(html.includes("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"), true);
  });
}
