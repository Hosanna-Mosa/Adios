import { z } from "zod";

export const vendorIdParamSchema = z.object({
  params: z.object({
    vendorId: z.string().min(1, "Vendor ID is required"),
  }),
});

export const foodItemIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Food item ID is required"),
  }),
});

export const addFoodItemSchema = z.object({
  body: z.object({
    vendorId: z.string().min(1, "vendorId is required"),
    name: z.string().min(1, "name is required"),
    description: z.string().optional(),
    price: z.coerce.number().optional(),
    images: z.array(z.string()).optional(),
    category: z.string().optional(),
    isVeg: z.boolean().optional(),
  }).catchall(z.any()),
});

export const updateFoodItemSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Food item ID is required"),
  }),
  body: z.record(z.string(), z.any()),
});

export const searchFoodItemsSchema = z.object({
  query: z.object({
    query: z.string().min(1, "Search query is required"),
  }),
});

export const store149ItemsSchema = z.object({
  query: z.object({
    lat: z.string().optional(),
    lng: z.string().optional(),
  }),
});

const digitalMenuItemInputSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.union([z.string(), z.number()]).optional(),
  category: z.string().optional(),
  images: z.array(z.string()).optional(),
  isVeg: z.boolean().optional(),
}).catchall(z.any());

export const saveRestaurantAndMenuSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name, phone, and address are required."),
    email: z.string().email("Invalid email").optional(),
    phone: z.string().min(1, "Name, phone, and address are required."),
    address: z.string().min(1, "Name, phone, and address are required."),
    isPureVeg: z.boolean().optional(),
    items: z.array(digitalMenuItemInputSchema).optional(),
  }),
});

export const restaurantIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Restaurant ID is required"),
  }),
});

export const updateRestaurantAndMenuSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Restaurant ID is required"),
  }),
  body: z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email").optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    isPureVeg: z.boolean().optional(),
    items: z.array(digitalMenuItemInputSchema).optional(),
  }),
});
