import { z } from "zod";

export const createTicketSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title, category and message are required"),
    category: z.string().min(1, "Title, category and message are required"),
    message: z.string().min(1, "Title, category and message are required"),
    // The order the ticket is about. Must be one of the sender's own orders.
    orderId: z.string().trim().min(1).max(64).optional(),
  }),
});

export const sendReplySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Ticket ID is required"),
  }),
  body: z.object({
    text: z.string().min(1, "Message text is required"),
  }),
});

export const resolveTicketSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Ticket ID is required"),
  }),
  body: z.object({
    approve: z.boolean().optional(),
  }),
});

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid id");

// GET /support/orders. Parsed again in the controller (Express 5 re-reads req.query).
export const supportOrderSearchQuery = z.object({
  q: z.string().trim().max(80).optional(),
  status: z.enum(["active", "completed", "cancelled"]).optional(),
  kind: z.enum(["packageDelivery", "ride", "food", "courier", "helper"]).optional(),
  from: z.iso.datetime({ message: "from must be an ISO date-time" }).optional(),
  to: z.iso.datetime({ message: "to must be an ISO date-time" }).optional(),
  customerId: objectId.optional(),
  driverUserId: objectId.optional(),
  vendorId: objectId.optional(),
  page: z.coerce.number().int().min(1).max(10_000).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const supportOrderSearchSchema = z.object({ query: supportOrderSearchQuery });

export const supportOrderIdSchema = z.object({
  params: z.object({ id: z.string().trim().min(1, "Order ID is required").max(64) }),
});
