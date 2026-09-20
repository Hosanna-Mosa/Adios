import { z } from "zod";

export const forgotVendorPasswordSchema = z.object({
  body: z.object({
    email: z.string().min(1, "Email is required"),
  }),
});

export const resetVendorPasswordSchema = z.object({
  body: z.object({
    email: z.string().min(1, "Email, OTP, and new password are required"),
    otp: z.string().min(1, "Email, OTP, and new password are required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const nearbyVendorsSchema = z.object({
  query: z.object({
    lat: z.string().optional(),
    lng: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    radius: z.coerce.number().min(0).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    sort: z.enum(["distance", "rating", "default"]).optional(),
    openNow: z.enum(["true", "false"]).optional(),
    search: z.string().optional(),
  }),
});

export const vendorIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Vendor ID is required"),
  }),
});

export const loginVendorSchema = z.object({
  body: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().min(1, "Email/phone and password are required"),
  }),
});

// The Vendor is constructed directly from named fields but the set is large
// and mostly optional in practice (a vendor is often created incrementally) —
// kept permissive, matching createMeatCenterSchema's approach.
export const createVendorSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().optional(),
  }).catchall(z.any()),
});

export const updateVendorSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Vendor ID is required"),
  }),
  body: z.record(z.string(), z.any()),
});

// Vendor onboarding is saved incrementally (draft/submitted) across a
// multi-step form — genuinely open-ended, validated server-side via
// requireFields() when status is "submitted". See onboarding.validation.ts
// for the same pattern on the driver side.
export const saveVendorOnboardingSchema = z.object({
  body: z.record(z.string(), z.any()),
});

export const searchGooglePlacesSchema = z.object({
  query: z.object({
    query: z.string().min(1, "Search query is required"),
    mode: z.string().optional(),
    types: z.string().optional(),
  }),
});

export const changeVendorPasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password and new password are required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
  }),
});

export const placeDetailsParamSchema = z.object({
  params: z.object({
    placeId: z.string().min(1, "placeId is required"),
  }),
});

export const requestVendorPayoutSchema = z.object({
  body: z.object({
    amount: z.coerce.number().min(100, "Minimum payout amount is Rs.100"),
  }),
});
