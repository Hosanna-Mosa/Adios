import { z } from "zod";
import { DigiLockerPurpose } from "../../database/models/DigiLockerSession";

/**
 * Zod schemas for the DigiLocker routes, applied through the shared
 * `validateRequest` middleware so bad input is rejected before any handler or
 * outbound DigiLocker call runs.
 */

/** POST /api/v1/digilocker/session */
export const startSessionSchema = z.object({
  body: z.object({
    purpose: z.nativeEnum(DigiLockerPurpose).optional(),
    /** Sandbox only — ignored in live mode. */
    persona: z.string().trim().max(64).optional(),
    verifiedMobile: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "verifiedMobile must be a 10-digit mobile number")
      .optional(),
    clientRedirectUrl: z.string().trim().url("clientRedirectUrl must be a valid URL").optional(),
  }),
});

/** POST /api/v1/digilocker/callback — app-driven code exchange. */
export const exchangeCodeSchema = z.object({
  body: z.object({
    code: z.string().trim().min(1, "Authorization code is required"),
    state: z.string().trim().min(1, "State is required"),
  }),
});

/** GET /api/v1/digilocker/callback — the browser redirect from DigiLocker. */
export const callbackQuerySchema = z.object({
  query: z.object({
    code: z.string().trim().min(1).optional(),
    state: z.string().trim().min(1, "State is required"),
    error: z.string().trim().optional(),
    error_description: z.string().trim().optional(),
  }),
});

/**
 * GET /api/v1/digilocker/documents/:uri
 *
 * DigiLocker URIs look like `in.gov.uidai-ADHAR-1234`. They arrive
 * percent-encoded and are restricted to the characters issuers actually use,
 * so a URI can never be bent into a path traversal against the upstream API.
 */
export const getDocumentSchema = z.object({
  params: z.object({
    uri: z
      .string()
      .trim()
      .min(1, "Document URI is required")
      .max(256)
      .regex(/^[A-Za-z0-9._:@-]+$/, "Invalid document URI"),
  }),
  query: z.object({
    format: z.enum(["pdf", "xml"]).optional(),
    /** When "1", a PDF is streamed as an attachment rather than inline. */
    download: z.enum(["0", "1"]).optional(),
  }),
});

/** GET /api/v1/digilocker/sessions */
export const listSessionsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

/** GET /api/v1/digilocker/sandbox/authorize — the simulated consent screen. */
export const sandboxAuthorizeQuerySchema = z.object({
  query: z.object({
    state: z.string().trim().min(1, "state is required"),
    code_challenge: z.string().trim().min(1, "code_challenge is required"),
    code_challenge_method: z.literal("S256", {
      message: "DigiLocker requires code_challenge_method=S256",
    }),
    client_id: z.string().trim().optional(),
    redirect_uri: z.string().trim().optional(),
    response_type: z.string().trim().optional(),
    persona: z.string().trim().max(64).optional(),
    dl_flow: z.string().trim().optional(),
    acr: z.string().trim().optional(),
    txn: z.string().trim().optional(),
  }),
});

/** POST /api/v1/digilocker/sandbox/authorize — approve or deny. */
export const sandboxDecisionSchema = z.object({
  body: z.object({
    state: z.string().trim().min(1, "state is required"),
    persona: z.string().trim().max(64).optional(),
    decision: z.enum(["approve", "deny"]).optional(),
  }),
});
