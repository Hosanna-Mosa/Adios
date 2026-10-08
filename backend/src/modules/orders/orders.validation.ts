import { z } from "zod";
import { ServiceType } from "../../database/models/Order";
import { FOOD_BROADCAST_CONFIG } from "../../config/dispatch.config";

const coordinateSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
}).refine((data) => (data.latitude !== undefined && data.longitude !== undefined) || (data.lat !== undefined && data.lng !== undefined), {
  message: "Latitude and longitude coordinates are required",
});

const stopInputSchema = z.object({
  id: z.string().optional(),
  address: z.string().optional(),
  type: z.string().optional(),
  items: z.any().optional(),
  instructions: z.string().optional(),
  deliveryAddress: z.union([z.string(), z.record(z.string(), z.any())]).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const packageDeliveryContactSchema = z.object({
  name: z.string().trim().min(1, "Enter the contact's name").max(80),
  phone: z.string().trim().regex(/^\d{10}$/, "Phone number must be 10 digits"),
});

/** Bike and auto are the only vehicles package delivery runs on. */
export const PACKAGE_DELIVERY_SERVICE_TYPES: string[] = [ServiceType.BIKE, ServiceType.AUTO];

/**
 * The Package delivery flow's extras on a bike/auto order (see IPackageDelivery). Also checked by the
 * online checkout before charging, since /payments takes orderData unvalidated.
 */
export const packageDeliverySchema = z.object({
  payAt: z.enum(["pickup", "drop"]),
  pickupContact: packageDeliveryContactSchema,
  dropContact: packageDeliveryContactSchema,
});

export const estimateFareSchema = z.object({
  query: z.object({
    pickupLat: z.string().refine((val) => !isNaN(Number(val)), "pickupLat must be a valid number"),
    pickupLng: z.string().refine((val) => !isNaN(Number(val)), "pickupLng must be a valid number"),
    dropLat: z.string().refine((val) => !isNaN(Number(val)), "dropLat must be a valid number"),
    dropLng: z.string().refine((val) => !isNaN(Number(val)), "dropLng must be a valid number"),
    serviceType: z.nativeEnum(ServiceType).optional(),
  }),
});

export const createOrderSchema = z.object({
  body: z.object({
    stops: z.array(stopInputSchema).min(1, "At least one stop is required"),
    serviceType: z.nativeEnum(ServiceType).optional(),
    vendorId: z.string().optional(),
    totals: z.object({
      subtotal: z.number().optional(),
      deliveryFee: z.number().optional(),
      tip: z.number().optional(),
      discount: z.number().optional(),
      couponCode: z.string().optional(),
      total: z.number().optional(),
    }).optional(),
    couponCode: z.string().optional(),
    radius: z.number().optional(),
    duration: z.number().optional(),
    isReserved: z.boolean().optional(),
    reservedAt: z.string().datetime({ message: "Invalid date-time format for reservedAt" }).optional().or(z.string().optional()),
    customerPrice: z.number().optional(),
    bookingFor: z.object({
      type: z.enum(["myself", "someone_else"]),
      contactNumber: z.string().optional(),
    }).optional(),
    scheduledDelivery: z.object({
      type: z.enum(["now", "later"]),
      requestedAt: z.string().datetime({ message: "Invalid date-time format for requestedAt" }).optional().or(z.string().optional()),
    }).optional(),
    scheduledFor: z.string().datetime({ message: "scheduledFor must be a valid ISO date-time" }).optional().or(z.string().optional()),
    // Orders placed here are always cash. Online orders are created by /payments after payment.
    paymentMethod: z.literal("cash", { message: "Online payments go through /payments/create-order" }).optional(),
    packageDelivery: packageDeliverySchema.optional(),
  }).refine((body) => !body.packageDelivery || PACKAGE_DELIVERY_SERVICE_TYPES.includes(String(body.serviceType)), {
    message: "Package delivery is only available by bike or auto",
    path: ["packageDelivery"],
  }),
});

export const requestScheduledDeliverySchema = z.object({
  body: z.object({
    vendorId: z.string().min(1, "Vendor ID is required"),
    scheduledFor: z.string().datetime({ message: "scheduledFor must be a valid future ISO datetime" }).or(z.string()),
  }),
});

export const scheduleDecisionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Order ID is required"),
  }),
  body: z.object({
    action: z.enum(["accept", "reject"], { message: "action must be 'accept' or 'reject'" }),
    reason: z.string().optional(),
  }),
});

export const respondScheduledDeliverySchema = z.object({
  params: z.object({
    requestId: z.string().min(1, "Request ID is required"),
  }),
  body: z.object({
    vendorId: z.string().min(1, "Vendor ID is required"),
    accepted: z.boolean(),
    reason: z.string().optional(),
  }),
});

// GET /orders/vendor/:vendorId — optional windowing for the partner app. With no
// query at all the outlet's whole history comes back, as the web vendor panel expects.
export const vendorOrdersQuerySchema = z.object({
  params: z.object({ vendorId: z.string().min(1, "Vendor ID is required") }),
  query: z.object({
    since: z.iso.datetime({ message: "since must be an ISO date-time" }).optional(),
    before: z.iso.datetime({ message: "before must be an ISO date-time" }).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

// The assigned driver confirms the cash they received. The server compares it with the order total.
export const cashCollectedSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    amount: z.number({ message: "Enter the cash amount you collected" }).positive().max(1_000_000),
  }),
});

const { prepMinutesMin, prepMinutesMax } = FOOD_BROADCAST_CONFIG;

export const restaurantAcceptSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    prepMinutes: z
      .number({ message: "Choose how long the food will take" })
      .int()
      .min(prepMinutesMin, `Prep time must be at least ${prepMinutesMin} minutes`)
      .max(prepMinutesMax, `Prep time can be at most ${prepMinutesMax} minutes`),
  }),
});
