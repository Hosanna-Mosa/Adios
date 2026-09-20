import { z } from "zod";

// The wire key is `itemId`, but `_id` is accepted too so the app can post a menu item
// straight through without remapping. One of the two must be present.
const cartItemSchema = z
  .looseObject({
    itemId: z.string().min(1).optional(),
    _id: z.string().min(1).optional(),
    name: z.string().min(1, "Item name is required"),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Item price cannot be negative").default(0),
    category: z.string().optional(),
    isVeg: z.boolean().optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    quantity: z.coerce.number().int().min(1, "Item quantity must be at least 1"),
  })
  .refine((item) => !!(item.itemId || item._id), {
    message: "Item id is required",
  });

export const saveCartSchema = z.object({
  body: z.object({
    vendorId: z.string().min(1).nullable().optional(),
    items: z.array(cartItemSchema).default([]),
  }),
});
