import Razorpay from "razorpay";
import * as dotenv from "dotenv";
import crypto from "crypto";
import { createRazorpayXPayout, getRazorpayXConfig } from "./razorpayx.client";

dotenv.config();

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET environment variables are not set");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/** Customer-payments client. Payouts will move to their own RazorpayX client (plan §5.4 C5). */
export const razorpayClient = razorpay;

export class PaymentService {
  async createRazorpayOrder(amount: number, currency: string = "INR") {
    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    try {
      const order = await razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error("Razorpay Order Creation Error:", error);
      throw new Error("Failed to create Razorpay order");
    }
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string) {
    // No test bypass: a mock signature is never accepted (plan §2 principle 13).
    if (typeof signature !== "string" || signature.length === 0) {
      return false;
    }
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(orderId + "|" + paymentId)
      .digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  /**
   * Sends a driver payout through RazorpayX. Returns null when RazorpayX is not configured —
   * the caller then keeps the payout as a request. There is no mock: nothing here ever
   * reports a payout as done unless RazorpayX itself does.
   */
  async createDriverPayout(input: PayoutInput) {
    return this.submitPayout("employee", "Driver cash out", input);
  }

  async createVendorPayout(input: PayoutInput) {
    return this.submitPayout("vendor", "Vendor cash out", input);
  }

  private async submitPayout(contactType: "employee" | "vendor", narration: string, input: PayoutInput) {
    const config = getRazorpayXConfig();
    if (!config) return null;
    return createRazorpayXPayout(config, {
      referenceId: input.referenceId,
      contactType,
      name: input.name,
      phone: input.phone,
      email: input.email,
      accountNumber: input.accountNumber,
      ifsc: input.ifsc,
      amountPaise: Math.round(input.amount * 100),
      narration,
      notes: input.notes,
    });
  }
}

type PayoutInput = {
  /** Our payout record id: RazorpayX reference_id and idempotency key. */
  referenceId: string;
  name: string;
  phone: string;
  email?: string;
  accountNumber: string;
  ifsc: string;
  amount: number; // rupees
  notes?: Record<string, string>;
};
