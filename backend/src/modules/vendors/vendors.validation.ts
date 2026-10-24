import { z } from "zod";
import { MIN_VENDOR_PAYOUT_AMOUNT } from "../../database/models/VendorPayout";

// --- Partner app (signed-in outlet) -----------------------------------------

export const setMyOpenStateSchema = z.object({
  body: z.object({
    isOpen: z.boolean({ message: "isOpen must be true or false" }),
  }),
});

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm (24-hour) times");
const dayHours = z.object({ open: hhmm, close: hhmm, closed: z.boolean() });

export const updateMyVendorProfileSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1, "Name cannot be empty").max(120).optional(),
      phone: z.string().trim().min(6, "Enter a valid phone number").max(20).optional(),
      email: z.string().trim().email("Enter a valid email").optional(),
      address: z.string().trim().min(1, "Address cannot be empty").max(500).optional(),
      image: z.string().trim().max(2048).optional(),
      // Empty string or null removes the branch code.
      branchCode: z.string().trim().max(50).nullable().optional(),
      currentLocation: z
        .object({
          lat: z.number().min(-90).max(90),
          lng: z.number().min(-180).max(180),
          address: z.string().trim().max(500).optional(),
        })
        .nullable()
        .optional(),
      // The whole week at once. open === close means open 24 hours; close before open runs past midnight.
      openingHours: z
        .object({ mon: dayHours, tue: dayHours, wed: dayHours, thu: dayHours, fri: dayHours, sat: dayHours, sun: dayHours })
        .optional(),
    }),
});

/** POST /vendors/me/delete — the partner's current password confirms the deletion. */
export const deleteMyPartnerAccountSchema = z.object({
  body: z.object({
    password: z.string().min(1, "Password is required").max(128),
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
// multi-step form, so almost every field is optional and completeness is
// checked by requireFields() when status is "submitted". The route is public,
// so this still pins every field to its type and a sane size: no objects where
// text belongs, no 50,000-row menus. Unknown keys are dropped. Mirrors the
// payload built in frontend/src/features/onboarding/hooks/useOnboardingForm.ts.
const onboardingText = (max: number) => z.string().max(max).nullish();
// Form inputs arrive as strings or numbers depending on the field widget.
const onboardingScalar = z.union([z.string().max(64), z.number(), z.boolean()]).nullish();
const onboardingFile = z.object({ name: z.string().max(255) }).nullish();
const onboardingTimeSlot = z.object({ open: z.string().max(10), close: z.string().max(10) });

export const saveVendorOnboardingSchema = z.object({
  body: z.object({
    status: onboardingText(20),
    partnerType: onboardingText(20),
    restaurantName: onboardingText(120),
    cuisines: z.array(z.string().max(60)).max(30).nullish(),
    ownerName: onboardingText(120),
    ownerEmail: onboardingText(254),
    email: onboardingText(254),
    portalPassword: onboardingText(128),
    ownerPhone: onboardingText(20),
    phone: onboardingText(20),
    primaryContact: onboardingText(20),
    sameAsOwner: z.boolean().nullish(),
    googlePlaceId: onboardingText(255),
    image: onboardingText(2048),
    location: z.object({ lat: z.number().min(-90).max(90).nullish(), lng: z.number().min(-180).max(180).nullish() }).nullish(),
    address: z
      .object({
        shopNo: onboardingText(120),
        floor: onboardingText(60),
        area: onboardingText(200),
        city: onboardingText(100),
        landmark: onboardingText(200),
        formattedAddress: onboardingText(500),
      })
      .nullish(),
    selectedDays: z.array(z.string().max(12)).max(7).nullish(),
    timeSlots: z.array(onboardingTimeSlot).max(20).nullish(),
    dayTimeSlots: z.record(z.string().max(12), z.array(onboardingTimeSlot).max(10)).nullish(),
    menuSetupMode: onboardingText(20),
    menuReferenceFile: onboardingFile,
    menuUploadValid: z.boolean().nullish(),
    menuUploadRows: z
      .array(
        z.object({
          category: onboardingText(100),
          itemName: onboardingText(200),
          price: onboardingScalar,
          description: onboardingText(1000),
          type: onboardingText(30),
          isBestseller: onboardingScalar,
          image: onboardingFile,
        })
      )
      .max(1000)
      .nullish(),
    menuCategories: z
      .array(
        z.object({
          name: onboardingText(100),
          items: z
            .array(
              z.object({
                name: onboardingText(200),
                price: onboardingScalar,
                description: onboardingText(1000),
                isVeg: onboardingScalar,
                isBestseller: onboardingScalar,
                photo: onboardingFile,
              })
            )
            .max(500)
            .nullish(),
        })
      )
      .max(100)
      .nullish(),
    panNumber: onboardingText(20),
    panFile: onboardingFile,
    gstin: onboardingText(20),
    gstFile: onboardingFile,
    gstExempt: z.boolean().nullish(),
    fssaiNumber: onboardingText(20),
    fssaiExpiry: onboardingText(40),
    fssaiFile: onboardingFile,
    bankAccount: onboardingText(34),
    bankConfirm: onboardingText(34),
    accountType: onboardingText(20),
    ifsc: onboardingText(11),
    chequeFile: onboardingFile,
    digilockerSessionId: onboardingText(128),
    digilockerKey: onboardingText(256),
    acceptedTos: z.boolean().nullish(),
    signature: onboardingText(200),
  }),
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
