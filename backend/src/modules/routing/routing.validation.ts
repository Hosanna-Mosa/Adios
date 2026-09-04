import { z } from "zod";

const coordinateSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const stopInputSchema = z.object({
  id: z.string().optional(),
  address: z.string().optional(),
  type: z.string().optional(),
  items: z.any().optional(),
}).catchall(z.any());

export const optimizeRouteSchema = z.object({
  body: z.object({
    origin: coordinateSchema,
    stops: z.array(stopInputSchema),
  }),
});
