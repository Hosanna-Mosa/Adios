import crypto from "crypto";

/**
 * Symmetric encryption helpers used to keep third-party OAuth material
 * (DigiLocker access/refresh tokens, PKCE verifiers, one-time auth codes)
 * encrypted at rest instead of sitting in Mongo as plaintext.
 *
 * Format: `v1.<iv>.<authTag>.<ciphertext>` — all parts base64url.
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // GCM standard nonce size
const PREFIX = "v1";

let cachedKey: Buffer | null = null;

/**
 * Resolve the 32-byte encryption key.
 *
 * Prefers an explicit DIGILOCKER_ENCRYPTION_KEY (hex or base64, 32 bytes
 * decoded). Falls back to deriving one from JWT_SECRET so the integration
 * still works on a stock `.env` — rotating JWT_SECRET therefore invalidates
 * stored DigiLocker tokens, which is the safe direction to fail.
 */
function getKey(): Buffer {
  if (cachedKey) return cachedKey;

  const raw = process.env.DIGILOCKER_ENCRYPTION_KEY || "";

  if (raw) {
    let parsed: Buffer | null = null;
    if (/^[0-9a-f]{64}$/i.test(raw)) {
      parsed = Buffer.from(raw, "hex");
    } else {
      const b64 = Buffer.from(raw, "base64");
      if (b64.length === 32) parsed = b64;
    }

    if (parsed && parsed.length === 32) {
      cachedKey = parsed;
      return cachedKey;
    }

    console.warn(
      "[CRYPTO] DIGILOCKER_ENCRYPTION_KEY is set but is not a 32-byte hex/base64 value — deriving a key from it instead."
    );
  }

  const seed = raw || process.env.JWT_SECRET || "supersecret123";
  cachedKey = crypto.scryptSync(seed, "digilocker-token-store", 32);
  return cachedKey;
}

/** Encrypt a UTF-8 string. Returns `null` for empty/undefined input. */
export function encryptSecret(plaintext?: string | null): string | null {
  if (!plaintext) return null;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    PREFIX,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

/**
 * Decrypt a value produced by {@link encryptSecret}.
 * Returns `null` when the payload is missing, malformed, or fails the
 * GCM auth check (e.g. the key was rotated) rather than throwing, so callers
 * can treat it as "no usable token" and re-run the consent flow.
 */
export function decryptSecret(payload?: string | null): string | null {
  if (!payload) return null;

  const parts = payload.split(".");
  if (parts.length !== 4 || parts[0] !== PREFIX) return null;

  try {
    const iv = Buffer.from(parts[1], "base64url");
    const authTag = Buffer.from(parts[2], "base64url");
    const ciphertext = Buffer.from(parts[3], "base64url");

    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/** Constant-time string comparison that tolerates differing lengths. */
export function safeEqual(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** URL-safe random token, used for `state` values and sandbox auth codes. */
export function randomToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

/**
 * Build an RFC 7636 PKCE pair. DigiLocker's partner OAuth requires S256.
 */
export function createPkcePair(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = crypto.randomBytes(48).toString("base64url"); // 64 chars, within the 43-128 spec range
  const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
  return { codeVerifier, codeChallenge };
}

/** Recompute the S256 challenge for a verifier, to validate a callback. */
export function deriveCodeChallenge(codeVerifier: string): string {
  return crypto.createHash("sha256").update(codeVerifier).digest("base64url");
}
