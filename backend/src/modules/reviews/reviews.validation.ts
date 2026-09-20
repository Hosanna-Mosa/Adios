import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, "Order ID is required"),
    rating: z.coerce.number().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
    driverRating: z.coerce.number().min(1).max(5).optional(),
    vendorRating: z.coerce.number().min(1).max(5).optional(),
    comment: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const getReviewByOrderSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, "Order ID is required"),
  }),
});
