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
    status: z.string().optional(),
    replyText: z.string().optional(),
    sender: z.string().optional(),
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
  targetUrl: z.string().optional(),
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
