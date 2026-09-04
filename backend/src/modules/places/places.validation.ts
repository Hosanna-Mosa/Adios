import { z } from "zod";

export const nearbyPlacesSchema = z.object({
  query: z.object({
    lat: z.string().min(1, "Latitude and longitude are required"),
    lng: z.string().min(1, "Latitude and longitude are required"),
    radius: z.string().optional(),
    type: z.string().optional(),
    keyword: z.string().optional(),
  }),
});

export const autocompleteSchema = z.object({
  query: z.object({
    input: z.string().min(1, "input query param is required"),
    lat: z.string().optional(),
    lng: z.string().optional(),
    radius: z.string().optional(),
  }),
});

export const placeDetailsSchema = z.object({
  params: z.object({
    placeId: z.string().min(1, "placeId param is required"),
  }),
});

export const reverseGeocodeSchema = z.object({
  query: z.object({
    lat: z.string().min(1, "Latitude and longitude are required"),
    lng: z.string().min(1, "Latitude and longitude are required"),
  }),
});
