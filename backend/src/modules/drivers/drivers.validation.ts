import { z } from "zod";
import { DriverStatus } from "../../database/models/Driver";

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(DriverStatus),
  }),
});

export const updateHomeModeSchema = z.object({
  body: z.object({
    homeMode: z.boolean(),
  }),
});

export const updateLocationSchema = z.object({
  body: z.object({
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    username: z.string().optional(),
    email: z.string().email("Invalid email").optional(),
    phone: z.string().optional(),
    gender: z.enum(["male", "female"]).optional(),
  }),
});

export const cashOutSchema = z.object({
  body: z.object({
    password: z.string().min(1, "Password is required to cash out"),
    amount: z.coerce.number().optional(),
  }),
});

export const nearbyDriversSchema = z.object({
  query: z.object({
    latitude: z.string().refine((val) => !isNaN(Number(val)), "latitude must be a valid number"),
    longitude: z.string().refine((val) => !isNaN(Number(val)), "longitude must be a valid number"),
    radius: z.string().optional(),
    vehicleType: z.string().optional(),
    onlineOnly: z.string().optional(),
  }),
});

export const highDemandAreasSchema = z.object({
  query: z.object({
    limit: z.string().optional(),
  }),
});
