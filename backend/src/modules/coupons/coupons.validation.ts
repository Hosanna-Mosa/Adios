import { z } from "zod";

export const listApplicableCouponsSchema = z.object({
  query: z.object({
    vendorId: z.string().optional(),
    subtotal: z.string().refine((val) => !isNaN(Number(val)), "subtotal must be a valid number").optional(),
  }),
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Promo code is required"),
    vendorId: z.string().optional(),
    subtotal: z.coerce.number().min(0, "Subtotal cannot be negative").optional(),
  }),
});
