import { z } from "zod";

export const createRazorpayOrderSchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive("Amount is required"),
    // What is being bought. Stored with the Payment so the server can place the order once
    // Razorpay confirms the money, even if the app is closed meanwhile.
    orderData: z.record(z.string(), z.any()).optional(),
    // Where the browser checkout sends the customer back. Checked against an allowlist server-side.
    returnUrl: z.string().max(500).optional(),
    language: z.enum(["en", "te", "hi"]).optional(),
  }),
});

// A helper task's price raise, paid online (the task itself was paid online).
export const createTopupSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, "orderId is required"),
    amount: z.coerce.number().int("Amount must be in whole rupees").positive().max(1000),
    returnUrl: z.string().max(500).optional(),
    language: z.enum(["en", "te", "hi"]).optional(),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z
    .object({
      razorpay_order_id: z.string().regex(/^order_[A-Za-z0-9]+$/, "razorpay_order_id is invalid"),
      // Present when the browser returned through the callback. Without them the server looks
      // the payment up at Razorpay itself (the customer closed the browser after paying).
      razorpay_payment_id: z.string().regex(/^pay_[A-Za-z0-9]+$/).optional(),
      razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/).optional(),
      orderData: z.record(z.string(), z.any()).optional(),
    })
    .refine((b) => !!b.razorpay_payment_id === !!b.razorpay_signature, {
      message: "razorpay_payment_id and razorpay_signature must be sent together",
    }),
});

export const checkoutStatusSchema = z.object({
  params: z.object({
    razorpayOrderId: z.string().regex(/^order_[A-Za-z0-9]+$/),
  }),
});
