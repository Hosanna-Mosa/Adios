import { z } from "zod";
import { ITEM_SORT_KEYS } from "./analytics.service";

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

export const topItemsSchema = z.object({
  query: z.object({
    days: z.coerce.number().int().min(1).max(365).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  }),
});

export const itemStatsSchema = z.object({
  query: z.object({
    days: z.coerce.number().int().min(1).max(365).optional(),
    vendorId: z.string().max(64).optional(),
    search: z.string().max(80).optional(),
    sort: z.enum(ITEM_SORT_KEYS).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    page: z.coerce.number().int().min(1).optional(),
    // Up to 2000 so the admin can export the whole list as CSV.
    limit: z.coerce.number().int().min(1).max(2000).optional(),
  }),
});

export const activitySummarySchema = z.object({
  query: z.object({
    days: z.coerce.number().int().min(1).max(30).optional(),
  }),
});
