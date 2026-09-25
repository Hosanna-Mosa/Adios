import { z } from "zod";

// The batch shape is checked here; each event inside it is checked (and
// silently dropped if bad) in the service, so one malformed event from an old
// app build never costs the rest of its batch.
export const ingestEventsSchema = z.object({
  body: z.object({
    events: z.array(z.unknown()).max(50, "At most 50 events per batch"),
  }),
});

export const liveActivitySchema = z.object({
  query: z.object({
    minutes: z.coerce.number().int().min(5).max(180).optional(),
  }),
});

export const activitySummarySchema = z.object({
  query: z.object({
    days: z.coerce.number().int().min(1).max(30).optional(),
  }),
});
