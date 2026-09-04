import { z } from "zod";
import { ZoneType } from "../../database/models/Zone";

const geoPointSchema = z.object({
  type: z.string().optional(),
  coordinates: z.array(z.number()).length(2, "coordinates must be [longitude, latitude]"),
}).catchall(z.any());

const geoPolygonSchema = z.object({
  type: z.string().optional(),
  coordinates: z.any(),
}).catchall(z.any());

export const createZoneSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Zone name is required"),
    type: z.nativeEnum(ZoneType),
    pricingMultiplier: z.coerce.number().optional(),
    isActive: z.boolean().optional(),
    center: geoPointSchema.optional(),
    radius: z.coerce.number().optional(),
    boundary: geoPolygonSchema.optional(),
    description: z.string().optional(),
    allowedServices: z.array(z.string()).optional(),
    activeHours: z.any().optional(),
    autoSurgeEnabled: z.boolean().optional(),
  }).catchall(z.any()),
});

export const updateZoneSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Zone ID is required"),
  }),
  body: z.object({
    name: z.string().optional(),
    type: z.nativeEnum(ZoneType).optional(),
    pricingMultiplier: z.coerce.number().optional(),
    isActive: z.boolean().optional(),
    center: geoPointSchema.optional(),
    radius: z.coerce.number().optional(),
    boundary: geoPolygonSchema.optional(),
    description: z.string().optional(),
    allowedServices: z.array(z.string()).optional(),
    activeHours: z.any().optional(),
    autoSurgeEnabled: z.boolean().optional(),
  }).catchall(z.any()),
});

export const zoneIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Zone ID is required"),
  }),
});

export const checkCoordinatesSchema = z.object({
  query: z.object({
    lat: z.string().refine((val) => !isNaN(Number(val)), "lat must be a valid number"),
    lng: z.string().refine((val) => !isNaN(Number(val)), "lng must be a valid number"),
    serviceType: z.string().optional(),
  }),
});
