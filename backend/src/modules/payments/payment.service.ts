import Razorpay from "razorpay";
import * as dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET environment variables are not set");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// The mock-payment shortcut below accepts a signature Razorpay never issued, so
// it has to be switched on deliberately rather than inferred. Keying it off
// NODE_ENV alone failed open: nothing in this project sets NODE_ENV, and an
// unset value is not "production", so the shortcut enabled itself everywhere —
// including on the live API. An absent ALLOW_MOCK_PAYMENTS now means no
// shortcut; NODE_ENV stays as a second lock that a stray "true" cannot pick.
const MOCK_PAYMENTS_ALLOWED =
  process.env.ALLOW_MOCK_PAYMENTS === "true" && process.env.NODE_ENV !== "production";

if (MOCK_PAYMENTS_ALLOWED) {
  console.warn(
    "[PAYMENTS] ALLOW_MOCK_PAYMENTS is on — any signature starting with 'sig_' is accepted without verification. Never set this outside local development."
  );
}

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
    // Local mock-checkout bypass. Off unless MOCK_PAYMENTS_ALLOWED opted in above.
    if (MOCK_PAYMENTS_ALLOWED && typeof signature === "string" && signature.startsWith("sig_")) {
      return true;
    }

    if (typeof signature !== "string" || signature.length === 0) {
      return false;
    }

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
    hmac.update(orderId + "|" + paymentId);
    const generated_signature = hmac.digest("hex");

    return generated_signature === signature;
  }

  async createDriverPayout(input: {
    name: string;
    phone: string;
    email?: string;
    accountNumber: string;
    ifsc: string;
    amount: number;
    notes?: Record<string, string>;
  }) {
    const accountNumber = process.env.RAZORPAYX_ACCOUNT_NUMBER;
    const isMock = !accountNumber || accountNumber.includes("placeholder") || accountNumber.includes("your_");

    if (isMock) {
      return {
        contact: { id: `cont_${Math.random().toString(36).substring(7)}` },
        fundAccount: { id: `fa_${Math.random().toString(36).substring(7)}` },
        payout: {
          id: `pout_${Math.random().toString(36).substring(7)}`,
          status: "processed"
        }
      };
    }

    try {
      const contact = await (razorpay as any).contacts.create({
        name: input.name,
        contact: input.phone,
        email: input.email,
        type: "employee",
        reference_id: `driver_${Date.now()}`,
      });

      const fundAccount = await (razorpay as any).fundAccount.create({
        contact_id: contact.id,
        account_type: "bank_account",
        bank_account: {
          name: input.name,
          ifsc: input.ifsc,
          account_number: input.accountNumber,
        },
      });

      const payout = await (razorpay as any).payouts.create({
        account_number: accountNumber,
        fund_account_id: fundAccount.id,
        amount: Math.round(input.amount * 100),
        currency: "INR",
        mode: "IMPS",
        purpose: "payout",
        queue_if_low_balance: true,
        reference_id: `driver_payout_${Date.now()}`,
        narration: "Driver cash out",
        notes: input.notes,
      });

      return { contact, fundAccount, payout };
    } catch (error) {
      console.error("Razorpay Driver Payout Error:", error);
      throw new Error("Failed to create driver payout");
    }
  }

  async createVendorPayout(input: {
    name: string;
    phone: string;
    email?: string;
    accountNumber: string;
    ifsc: string;
    amount: number;
    notes?: Record<string, string>;
  }) {
    const accountNumber = process.env.RAZORPAYX_ACCOUNT_NUMBER;
    const isMock = !accountNumber || accountNumber.includes("placeholder") || accountNumber.includes("your_");

    if (isMock) {
      return {
        contact: { id: `cont_v_${Math.random().toString(36).substring(7)}` },
        fundAccount: { id: `fa_v_${Math.random().toString(36).substring(7)}` },
        payout: {
          id: `pout_v_${Math.random().toString(36).substring(7)}`,
          status: "processed"
        }
      };
    }

    try {
      const contact = await (razorpay as any).contacts.create({
        name: input.name,
        contact: input.phone,
        email: input.email,
        type: "vendor",
        reference_id: `vendor_${Date.now()}`,
      });

      const fundAccount = await (razorpay as any).fundAccount.create({
        contact_id: contact.id,
        account_type: "bank_account",
        bank_account: {
          name: input.name,
          ifsc: input.ifsc,
          account_number: input.accountNumber,
        },
      });

      const payout = await (razorpay as any).payouts.create({
        account_number: accountNumber,
        fund_account_id: fundAccount.id,
        amount: Math.round(input.amount * 100),
        currency: "INR",
        mode: "IMPS",
        purpose: "payout",
        queue_if_low_balance: true,
        reference_id: `vendor_payout_${Date.now()}`,
        narration: "Vendor cash out",
        notes: input.notes,
      });

      return { contact, fundAccount, payout };
    } catch (error) {
      console.error("Razorpay Vendor Payout Error:", error);
      throw new Error("Failed to create vendor payout");
    }
  }
}
