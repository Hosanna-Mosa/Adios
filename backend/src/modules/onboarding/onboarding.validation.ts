import { z } from "zod";

// The onboarding form is saved incrementally across many steps (vehicle info,
// documents, bank details, etc.) — the body is a genuinely open-ended partial
// object merged server-side (see saveOnboardingData's `Partial<IDriver>`), so
// this intentionally just checks it's an object rather than enumerating every
// field and risking rejecting a currently-working step.
export const saveOnboardingSchema = z.object({
  body: z.record(z.string(), z.any()),
});

export const verifyAadhaarSchema = z.object({
  body: z.object({
    aadhaarNumber: z.string().min(1, "Aadhaar number is required"),
  }),
});

export const verifyPanSchema = z.object({
  body: z.object({
    panNumber: z.string().min(1, "PAN number is required"),
  }),
});

export const digilockerAuthUrlSchema = z.object({
  query: z.object({
    state: z.string().optional(),
  }),
});

export const verifyDigilockerSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Authorization code is required"),
  }),
});
