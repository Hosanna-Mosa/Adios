import { z } from "zod";

export const createRazorpayOrderSchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive("Amount is required"),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_payment_id: z.string().min(1, "razorpay_payment_id is required"),
    razorpay_order_id: z.string().min(1, "razorpay_order_id is required"),
    razorpay_signature: z.string().min(1, "razorpay_signature is required"),
    orderData: z.record(z.string(), z.any()).optional(),
  }),
});
