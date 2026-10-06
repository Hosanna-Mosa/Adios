import { customFetch } from "@/utils/api/custom-fetch";
import type { PayoutRequestResult, PayoutSummary } from "@/types/models";

// The outlet's earnings and payouts — backend vendor-payouts.controller.ts
// (summary) and vendors.controller.ts requestVendorPayout (request).

export const getPayoutSummary = () => customFetch<PayoutSummary>("/vendors/me/payouts");

/**
 * Asks for `amount` rupees to be sent to the outlet's verified bank account.
 * The server re-checks the balance; the answer says whether the money went out
 * at once (RazorpayX) or waits for the Flavour team.
 */
export const requestPayout = (amount: number) =>
  customFetch<PayoutRequestResult>("/vendors/payout", { method: "POST", body: JSON.stringify({ amount }) });
