import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    username: z.string().optional(),
    email: z.string().email("Invalid email").optional(),
    phone: z.string().optional(),
    bio: z.string().optional(),
  }),
});

const coordinatesSchema = z.object({
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
}).optional();

export const addAddressSchema = z.object({
  body: z.object({
    label: z.string().optional(),
    addressLine: z.string().optional(),
    phone: z.string().optional(),
    coordinates: coordinatesSchema,
  }),
});

export const updateAddressSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Address ID is required"),
  }),
  body: z.object({
    label: z.string().optional(),
    addressLine: z.string().optional(),
    phone: z.string().optional(),
    coordinates: coordinatesSchema,
  }),
});

export const addressIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Address ID is required"),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
  }),
});

export const saveBookingPreferenceSchema = z.object({
  body: z.object({
    type: z.enum(["myself", "someone_else"], { message: "Valid booking type is required." }),
    contactNumber: z.string().optional(),
  }),
});

export const toggleFavoriteSchema = z.object({
  params: z.object({
    vendorId: z.string().min(1, "Vendor ID is required"),
  }),
});

export const toggleFavoriteItemSchema = z.object({
  params: z.object({
    itemId: z.string().min(1, "Item ID is required"),
  }),
});

export const updatePushTokenSchema = z.object({
  body: z.object({
    expoPushToken: z.string().min(1, "expoPushToken is required"),
  }),
});
