import { z } from "zod";

// The onboarding form is saved incrementally across many steps (vehicle info,
// documents, bank details, etc.) — the body is a genuinely open-ended partial
// object merged server-side (see saveOnboardingData's `Partial<IDriver>`), so
// this intentionally just checks it's an object rather than enumerating every
// field and risking rejecting a currently-working step.
export const saveOnboardingSchema = z.object({
  body: z.record(z.string(), z.any()).superRefine((body, ctx) => {
    // The few fields with an exact shape are checked here; the rest stay open as described above.
    const account = body.bankAccountNumber;
    if (account !== undefined && (typeof account !== "string" || !/^\d{9,18}$/.test(account) || /^(\d)\1+$/.test(account))) {
      ctx.addIssue({ code: "custom", path: ["bankAccountNumber"], message: "Enter a valid bank account number (9 to 18 digits)" });
    }
    const ifsc = body.bankIfsc;
    if (ifsc !== undefined && (typeof ifsc !== "string" || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase()))) {
      ctx.addIssue({ code: "custom", path: ["bankIfsc"], message: "Enter a valid IFSC code, like SBIN0001234" });
    }
  }),
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
