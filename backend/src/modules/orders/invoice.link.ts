import { DOCUMENT_LINK_TTL_SECONDS, readDocumentToken, signDocumentToken } from "../../utils/documentLink";

/**
 * Invoice links the app can open in the phone's browser. The invoice endpoint needs
 * the user's session, which a browser tab doesn't carry, so the app asks for a link
 * holding a short-lived token that is good for this one order's invoice and nothing
 * else (see utils/documentLink).
 */

export const INVOICE_LINK_TTL_SECONDS = DOCUMENT_LINK_TTL_SECONDS;
const PURPOSE = "invoice";

export function signInvoiceToken(orderId: string, userId: string): string {
  return signDocumentToken(PURPOSE, { orderId, sub: userId });
}

/** True only for an unexpired invoice token minted for exactly this order. */
export function invoiceTokenAllows(token: unknown, orderId: string): boolean {
  return readDocumentToken(token, PURPOSE)?.orderId === orderId;
}

/** Orders an invoice exists for: finished and not cancelled. */
export function isInvoiceable(status: unknown): boolean {
  return ["delivered", "completed"].includes(String(status || "").toLowerCase());
}
