import { z } from "zod";
import { DRIVER_RESUBMITTABLE_DOCUMENTS } from "../../database/models/Driver";
import { VENDOR_RESUBMITTABLE_DOCUMENTS } from "../../database/models/Vendor";
import { DRIVER_REVIEW_STATUSES, VENDOR_REVIEW_STATUSES } from "./verification.service";

const idParams = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid id"),
});

/** GET /admin/verifications/drivers */
export const listDriverVerificationsSchema = z.object({
  query: z.object({
    status: z.enum([...DRIVER_REVIEW_STATUSES, "all"]).optional(),
  }),
});

/** GET /admin/verifications/vendors */
export const listVendorVerificationsSchema = z.object({
  query: z.object({
    status: z.enum([...VENDOR_REVIEW_STATUSES, "all"]).optional(),
  }),
});

/** POST /admin/verifications/{drivers,vendors}/:id/approve */
export const approveSchema = z.object({
  params: idParams,
});

/** POST /admin/verifications/{drivers,vendors}/:id/reject */
export const rejectSchema = z.object({
  params: idParams,
  body: z.object({
    reason: z.string().trim().max(500).optional(),
  }),
});

const note = z.string().trim().max(1000).optional();

/** POST /admin/verifications/drivers/:id/request-documents */
export const requestDriverDocumentsSchema = z.object({
  params: idParams,
  body: z.object({
    documents: z.array(z.enum(DRIVER_RESUBMITTABLE_DOCUMENTS)).min(1, "Select at least one document"),
    note,
  }),
});

/** POST /admin/verifications/vendors/:id/request-documents */
export const requestVendorDocumentsSchema = z.object({
  params: idParams,
  body: z.object({
    documents: z.array(z.enum(VENDOR_RESUBMITTABLE_DOCUMENTS)).min(1, "Select at least one document"),
    note,
  }),
});
