import { z } from "zod";
import { MIN_VENDOR_PAYOUT_AMOUNT } from "../../database/models/VendorPayout";

// --- Partner app (signed-in outlet) -----------------------------------------

export const setMyOpenStateSchema = z.object({
  body: z.object({
    isOpen: z.boolean({ message: "isOpen must be true or false" }),
  }),
});

export const partnerPushTokenSchema = z.object({
  body: z.object({
    // The same shape NotificationService.sendPushNotificationsBatch accepts.
    expoPushToken: z.string().regex(/^ExponentPushToken\[.+\]$/, "expoPushToken must be an Expo push token"),
  }),
});

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

/** POST /vendors/onboarding/digilocker/session */
export const startOnboardingDigilockerSchema = z.object({
  body: z.object({
    /** Sandbox only — ignored in live mode. */
    persona: z.string().trim().max(64).optional(),
    verifiedMobile: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "verifiedMobile must be a 10-digit mobile number")
      .optional(),
  }),
});

/** GET /vendors/onboarding/digilocker/session/:sessionId */
export const onboardingDigilockerResultSchema = z.object({
  params: z.object({
    sessionId: z.string().trim().min(1, "Session ID is required").max(64),
  }),
});

// The applicant's portal credentials, re-checked on every call because the
// partner website holds no session for them.
const applicantCredentials = {
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(1, "Email/phone and password are required"),
};

/** POST /vendors/onboarding/application */
export const vendorApplicationSchema = z.object({
  body: z.object(applicantCredentials),
});

/** POST /vendors/onboarding/resubmit — documents are checked per requested group. */
export const resubmitVendorDocumentsSchema = z.object({
  body: z.object({
    ...applicantCredentials,
    documents: z.record(z.string(), z.any()).optional(),
  }),
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
    amount: z.coerce.number().min(MIN_VENDOR_PAYOUT_AMOUNT, `Minimum payout amount is Rs.${MIN_VENDOR_PAYOUT_AMOUNT}`),
  }),
});
