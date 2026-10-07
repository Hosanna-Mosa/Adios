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

// Optional numeric dish attributes: null clears, absent leaves alone. null is matched
// before coercion because z.coerce.number() would turn it into 0.
const nullable = <T extends z.ZodTypeAny>(schema: T) => z.union([z.null(), schema]).optional();
const offerPriceField = nullable(z.coerce.number().positive("offerPrice must be greater than 0"));
const nonNegativeField = (field: string) => nullable(z.coerce.number().min(0, `${field} must be 0 or more`));
const bestsellerMinOrdersField = nullable(
  z.coerce.number().int("bestsellerMinOrders must be a whole number").min(0, "bestsellerMinOrders must be 0 or more")
);

export const addFoodItemSchema = z.object({
  body: z.object({
    vendorId: z.string().min(1, "vendorId is required"),
    name: z.string().min(1, "name is required"),
    description: z.string().optional(),
    price: z.coerce.number().optional(),
    images: z.array(z.string()).optional(),
    category: z.string().optional(),
    isVeg: z.boolean().optional(),
    offerPrice: offerPriceField,
    protein: nonNegativeField("protein"),
    calories: nonNegativeField("calories"),
    bestsellerMinOrders: bestsellerMinOrdersField,
  }).catchall(z.any()),
});

export const updateFoodItemSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Food item ID is required"),
  }),
  body: z.object({
    name: z.string().trim().min(1, "name cannot be empty").optional(),
    description: z.string().optional(),
    price: z.coerce.number().positive("price must be greater than 0").optional(),
    images: z.array(z.string()).optional(),
    category: z.string().trim().min(1, "category cannot be empty").optional(),
    isAvailable: z.boolean().optional(),
    isVeg: z.boolean().optional(),
    offerPrice: offerPriceField,
    protein: nonNegativeField("protein"),
    calories: nonNegativeField("calories"),
    bestsellerMinOrders: bestsellerMinOrdersField,
  }).catchall(z.any()),
});

/** One spreadsheet row of a bulk menu upload — validated per row by the controller. */
export const bulkFoodRowSchema = z.object({
  name: z.string({ error: "name is required" }).trim().min(1, "name is required"),
  category: z.string({ error: "category is required" }).trim().min(1, "category is required"),
  price: z.coerce.number({ error: "price must be a number" }).positive("price must be greater than 0"),
  description: z.string().trim().optional(),
  offerPrice: offerPriceField,
  // Spreadsheet-style "Yes"/"No" is accepted alongside real booleans.
  isVeg: z.preprocess(
    (value) => (typeof value === "string" ? /^(yes|y|true|veg)$/i.test(value.trim()) : value),
    z.boolean({ error: "isVeg must be true or false" })
  ).optional().default(false),
  protein: nonNegativeField("protein"),
  calories: nonNegativeField("calories"),
}).refine(
  (row) => row.offerPrice === null || row.offerPrice === undefined || row.offerPrice < row.price,
  { message: "offerPrice must be less than price", path: ["offerPrice"] }
);

export const bulkFoodItemsSchema = z.object({
  body: z.object({
    vendorId: z.string().regex(/^[a-f\d]{24}$/i, "vendorId must be a valid id"),
    items: z
      .array(z.any())
      .min(1, "items must contain at least one row")
      .max(500, "items can contain at most 500 rows"),
  }),
});

export const searchFoodItemsSchema = z.object({
  query: z.object({
    query: z.string().min(1, "Search query is required"),
    lat: z.string().optional(),
    lng: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
  }),
});

export const updateFoodItemAvailabilitySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Food item ID is required"),
  }),
  body: z.object({
    isAvailable: z.boolean(),
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
