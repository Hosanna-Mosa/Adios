import { z } from "zod";

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().min(1, "Email is required"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().min(1, "Email, OTP, and new password are required"),
    otp: z.string().min(1, "Email, OTP, and new password are required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const loginMeatCenterSchema = z.object({
  body: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().min(1, "Email/phone and password are required"),
  }),
});

export const nearbyMeatCentersSchema = z.object({
  query: z.object({
    lat: z.string().optional(),
    lng: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    category: z.string().optional(),
    all: z.string().optional(),
    radius: z.coerce.number().min(0).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    sort: z.enum(["distance", "rating", "default"]).optional(),
    openNow: z.enum(["true", "false"]).optional(),
  }),
});

// MeatCenter is constructed directly from the body (`new MeatCenter(req.body)`)
// so this is intentionally permissive — see food/onboarding validation for the
// same pattern.
export const createMeatCenterSchema = z.object({
  body: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
  }).catchall(z.any()),
});

export const meatCenterIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Meat center ID is required"),
  }),
});

export const updateMeatCenterSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Meat center ID is required"),
  }),
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
    location: z.any().optional(),
    address: z.string().optional(),
    image: z.string().optional(),
    categories: z.array(z.string()).optional(),
    isOpen: z.boolean().optional(),
    openingHours: z.record(z.string(), z.any()).optional(),
    isManuallyClosed: z.boolean().optional(),
    deliveryFee: z.coerce.number().optional(),
    minOrderValue: z.coerce.number().optional(),
  }),
});

export const updateGlobalMeatPricesSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      name: z.string(),
      price: z.coerce.number(),
    }).catchall(z.any())),
  }),
});

export const meatCenterMenuParamSchema = z.object({
  params: z.object({
    centerId: z.string().min(1, "Meat center ID is required"),
  }),
  query: z.object({
    includeUnavailable: z.string().optional(),
  }),
});

export const vendorMeatMenuParamSchema = z.object({
  params: z.object({
    centerId: z.string().min(1, "Meat center ID is required"),
  }),
});

export const meatItemIdParamSchema = z.object({
  params: z.object({
    itemId: z.string().min(1, "Meat item ID is required"),
  }),
});

export const updateMeatItemAvailabilitySchema = z.object({
  params: z.object({
    itemId: z.string().min(1, "Meat item ID is required"),
  }),
  body: z.object({
    isAvailable: z.boolean(),
  }),
});

export const updateMeatItemPriceSchema = z.object({
  params: z.object({
    itemId: z.string().min(1, "Meat item ID is required"),
  }),
  body: z.object({
    price: z.coerce.number().min(0, "Valid price is required"),
  }),
});

const meatItemFields = {
  name: z.string().trim().min(1, "Name is required").max(80),
  weight: z.string().trim().min(1, "Weight / pack size is required").max(40),
  price: z.coerce.number().positive("Price must be more than 0").max(100000),
  category: z.string().trim().min(1, "Category is required").max(40),
  image: z.string().trim().max(2048).optional(),
  description: z.string().trim().max(300).optional(),
  isAvailable: z.boolean().optional(),
};

/** A partner adds an item to their own meat inventory. */
export const createMyMeatItemSchema = z.object({ body: z.object(meatItemFields) });

/** A partner edits an item; every field optional. */
export const updateMyMeatItemSchema = z.object({
  params: z.object({ itemId: z.string().min(1, "Meat item ID is required") }),
  body: z.object(meatItemFields).partial().refine((b) => Object.keys(b).length > 0, "Nothing to update"),
});

export const changeMeatVendorPasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password and new password are required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
  }),
});
