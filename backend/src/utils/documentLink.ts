import jwt from "jsonwebtoken";
import { getJwtSecret } from "./jwtSecret";

/**
 * Short-lived tokens for document links the apps open in the phone's browser (which
 * can't send the session header): order invoices, driver earnings statements. Each
 * token names its `purpose`, so it opens only that kind of document — and, carrying no
 * userId/role, it can never pass as a session token.
 */

export const DOCUMENT_LINK_TTL_SECONDS = 10 * 60;

export function signDocumentToken(purpose: string, claims: Record<string, string>): string {
  return jwt.sign({ ...claims, purpose }, getJwtSecret(), { expiresIn: DOCUMENT_LINK_TTL_SECONDS });
}

/** The token's claims when it is unexpired and minted for `purpose`; otherwise null. */
export function readDocumentToken(token: unknown, purpose: string): Record<string, unknown> | null {
  if (typeof token !== "string" || !token) return null;
  try {
    const payload = jwt.verify(token, getJwtSecret()) as Record<string, unknown>;
    return payload.purpose === purpose ? payload : null;
  } catch {
    return null;
  }
}
