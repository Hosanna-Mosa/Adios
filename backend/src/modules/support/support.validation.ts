import { z } from "zod";

export const createTicketSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title, category and message are required"),
    category: z.string().min(1, "Title, category and message are required"),
    message: z.string().min(1, "Title, category and message are required"),
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
