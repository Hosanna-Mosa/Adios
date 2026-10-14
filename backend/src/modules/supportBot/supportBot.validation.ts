import { z } from "zod";
import { SUPPORT_INTENT_CATEGORIES } from "../../database/models/SupportIntent";

const lang = z.enum(["en", "te", "hi"]);

export const listIntentsSchema = z.object({
  query: z.object({ lang: lang.optional() }).passthrough(),
});

export const listOrdersSchema = z.object({
  query: z.object({ category: z.enum(["ride", "food", "meat", "package", "helper"]).optional() }).passthrough(),
});

export const askSchema = z.object({
  body: z.object({
    intentKey: z.string().min(1),
    orderId: z.string().min(1).optional(),
    lang: lang.optional(),
  }),
});

export const queryIdSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid id") }),
});

export const feedbackSchema = z.object({
  params: queryIdSchema.shape.params,
  body: z.object({ helpful: z.boolean() }),
});

const localized = z.object({
  en: z.string().trim().min(1, "English text is required"),
  te: z.string().trim().optional().default(""),
  hi: z.string().trim().optional().default(""),
});
const localizedOptional = z.object({
  en: z.string().trim().optional().default(""),
  te: z.string().trim().optional().default(""),
  hi: z.string().trim().optional().default(""),
});

const intentBody = z.object({
  key: z.string().trim().regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers and underscores").min(2),
  category: z.enum(SUPPORT_INTENT_CATEGORIES),
  question: localized,
  resolver: z.string().min(1),
  needsOrder: z.boolean().optional(),
  staticAnswer: localizedOptional.optional(),
  enabled: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const createIntentSchema = z.object({ body: intentBody });

export const updateIntentSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid id") }),
  // key is the stable identity (used by seeding), so it can't be changed after creation.
  body: intentBody.omit({ key: true }).partial(),
});

export const deleteIntentSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid id") }),
});
