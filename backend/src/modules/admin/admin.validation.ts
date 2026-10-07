import { z } from "zod";
import { UserRole } from "../../database/models/User";
import { DriverStatus, OnboardingStatus } from "../../database/models/Driver";

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});

export const orderIdParamSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, "Order ID is required"),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name and phone are required"),
    email: z.string().email("Invalid email").optional(),
    phone: z.string().min(1, "Name and phone are required"),
    role: z.nativeEnum(UserRole).optional(),
    password: z.string().optional(),
    vehicleType: z.string().optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
  body: z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email").optional(),
    phone: z.string().optional(),
    role: z.nativeEnum(UserRole).optional(),
    isBlocked: z.boolean().optional(),
  }),
});

export const updateDriverSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Driver ID is required"),
  }),
  body: z.object({
    status: z.nativeEnum(DriverStatus).optional(),
    isAvailable: z.boolean().optional(),
    vehicleType: z.string().optional(),
    gender: z.string().optional(),
    isBlocked: z.boolean().optional(),
    onboardingStatus: z.nativeEnum(OnboardingStatus).optional(),
    aadhaarVerified: z.boolean().optional(),
    bankVerified: z.boolean().optional(),
    preferredZone: z.string().optional(),
    preferredZones: z.array(z.string()).optional(),
  }),
});

// Order is updated directly from the body (`findByIdAndUpdate(id, req.body)`)
// — intentionally permissive, same pattern as other admin write-anything
// endpoints (see meat/vendors validation files).
export const updateOrderSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Order ID is required"),
  }),
  body: z.record(z.string(), z.any()),
});

export const createSupportTicketSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    category: z.string().optional(),
    message: z.string().optional(),
    user: z.string().optional(),
  }),
});

export const updateSupportTicketSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Ticket ID is required"),
  }),
  body: z.object({
    status: z.enum(["OPEN", "RESOLVED", "PENDING_RESOLVE"]).optional(),
    replyText: z.string().optional(),
    sender: z.string().optional(),
  }),
});

// bcrypt ignores everything past 72 bytes, so a longer password would give a false sense of strength.
const supportPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

export const createSupportMemberSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required").max(80),
    // Login lowercases the identifier before matching on email, so store it lowercase too.
    email: z.string().trim().toLowerCase().email("Invalid email"),
    password: supportPasswordSchema,
  }),
});

export const resetSupportMemberPasswordSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Member ID is required"),
  }),
  body: z.object({
    password: supportPasswordSchema,
  }),
});

export const createOrderSchema = z.object({
  body: z.object({
    origin: z.string().optional(),
    stopsCount: z.union([z.string(), z.number()]).optional(),
    driverName: z.string().optional(),
  }),
});

export const updateSystemConfigSchema = z.object({
  body: z.object({
    rates: z.any().optional(),
    platformFee: z.coerce.number().optional(),
    surgeMultiplier: z.coerce.number().optional(),
  }),
});

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Code, discount type, and discount value are required"),
    discountType: z.enum(["PERCENTAGE", "FLAT"]),
    discountValue: z.coerce.number(),
    maxDiscount: z.coerce.number().optional(),
    minOrderValue: z.coerce.number().optional(),
    expiryDate: z.string().optional(),
  }),
});

export const updateAppVersionSchema = z.object({
  body: z.object({
    platform: z.string().min(1, "platform, latest, minRequired, and storeUrl are required"),
    latest: z.string().min(1, "platform, latest, minRequired, and storeUrl are required"),
    minRequired: z.string().min(1, "platform, latest, minRequired, and storeUrl are required"),
    storeUrl: z.string().min(1, "platform, latest, minRequired, and storeUrl are required"),
  }),
});

export const updateDevDriverSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Driver ID is required"),
  }),
  body: z.object({
    status: z.string().optional(),
    vehicleType: z.string().optional(),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
  }),
});

const bannerBodySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  // Where a tap on the banner goes (opened with Linking.openURL); "" clears it.
  targetUrl: z.union([z.literal(""), z.string().trim().url("Link URL must be a valid URL")]).optional(),
  itemType: z.enum(["banner", "ad"]).optional(),
  position: z.enum(["hero", "startup", "below_greetings", "driver_dashboard", "inline"]).optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.coerce.number().optional(),
  color1: z.string().optional(),
  color2: z.string().optional(),
});

export const createBannerSchema = z.object({
  body: bannerBodySchema.extend({
    title: z.string().min(1, "Title and Image URL are required"),
    imageUrl: z.string().min(1, "Title and Image URL are required"),
  }),
});

export const updateBannerSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Banner ID is required"),
  }),
  body: bannerBodySchema,
});

// --- Offers (customer app Offers page) --------------------------------------

const objectIdString = (label: string) => z.string().regex(/^[a-f\d]{24}$/i, `${label} must be a valid id`);
// "" / null from a cleared form field means "no date".
const optionalDate = z
  .union([z.literal(""), z.null(), z.coerce.date({ error: "Enter a valid date" })])
  .optional()
  .transform((value) => (value === "" ? null : value));
const optionalNonNegative = z.union([z.null(), z.coerce.number().min(0, "Must be 0 or more")]).optional();

const offerBodySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(500).optional(),
  vendor: objectIdString("Restaurant"),
  discountType: z.enum(["PERCENTAGE", "FLAT"]),
  discountValue: z.coerce.number().positive("Discount value must be greater than 0"),
  maxDiscount: optionalNonNegative,
  minOrderValue: optionalNonNegative,
  couponCode: z.string().trim().max(40).optional(),
  imageUrl: z.union([z.literal(""), z.string().trim().url("Image must be a valid URL")]).optional(),
  startDate: optionalDate,
  endDate: optionalDate,
  isActive: z.boolean().optional(),
  displayOrder: z.coerce.number().int().optional(),
});

const offerRules = <T extends z.ZodType<any>>(schema: T) =>
  schema
    .refine((body: any) => !(body.discountType === "PERCENTAGE" && body.discountValue > 100), {
      message: "A percentage discount cannot exceed 100",
      path: ["discountValue"],
    })
    .refine((body: any) => !(body.startDate && body.endDate && body.endDate < body.startDate), {
      message: "End date must be after the start date",
      path: ["endDate"],
    });

export const createOfferSchema = z.object({
  body: offerRules(offerBodySchema),
});

export const updateOfferSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Offer ID is required"),
  }),
  body: offerRules(offerBodySchema.partial()),
});
