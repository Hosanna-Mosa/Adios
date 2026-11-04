import crypto from "crypto";


const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
export const ENCRYPTED_PREFIX = "enc:";

let keyring: { activeId: string; keys: Map<string, Buffer> } | null = null;

function parseKey(raw: string, label: string): Buffer {
  const value = raw.trim();
  if (/^[0-9a-f]{64}$/i.test(value)) return Buffer.from(value, "hex");
  const b64 = Buffer.from(value, "base64");
  if (b64.length === 32) return b64;
  throw new Error(`${label} must be 32 bytes, as 64 hex characters or base64`);
}

function loadKeyring() {
  if (keyring) return keyring;

  const raw = process.env.DATA_ENCRYPTION_KEY || "";
  if (!raw) {
    throw new Error(
      "DATA_ENCRYPTION_KEY is not set. Generate one with `node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"`."
    );
  }

  const activeId = (process.env.DATA_ENCRYPTION_KEY_ID || "1").trim();
  if (!/^[A-Za-z0-9_-]+$/.test(activeId)) {
    throw new Error("DATA_ENCRYPTION_KEY_ID may only contain letters, digits, '-' and '_'");
  }

  const keys = new Map<string, Buffer>();
  keys.set(activeId, parseKey(raw, "DATA_ENCRYPTION_KEY"));

  for (const entry of (process.env.DATA_ENCRYPTION_OLD_KEYS || "").split(",").map((s) => s.trim()).filter(Boolean)) {
    const sep = entry.indexOf(":");
    const id = entry.slice(0, sep);
    if (sep < 1 || !/^[A-Za-z0-9_-]+$/.test(id)) {
      throw new Error("DATA_ENCRYPTION_OLD_KEYS must look like 'id:key,id:key'");
    }
    if (keys.has(id)) throw new Error(`DATA_ENCRYPTION_OLD_KEYS repeats key id '${id}'`);
    keys.set(id, parseKey(entry.slice(sep + 1), `DATA_ENCRYPTION_OLD_KEYS entry '${id}'`));
  }

  keyring = { activeId, keys };
  return keyring;
}

/** Throws if the key is missing or malformed. Call at startup so a bad deploy fails at boot, not on first request. */
export function assertFieldEncryptionConfigured(): void {
  loadKeyring();
}

/** Forget the cached keyring (tests, or after changing the env). */
export function resetFieldEncryptionKeys(): void {
  keyring = null;
}

export function isEncrypted(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(ENCRYPTED_PREFIX);
}

/**
 * Encrypt a string. Already-encrypted values pass through unchanged, so a value read
 * raw and written back (or copied between subdocuments) is never encrypted twice.
 * Non-strings (null/undefined/numbers) are returned as they are.
 */
export function encryptField<T>(value: T): T | string {
  if (typeof value !== "string" || value === "" || isEncrypted(value)) return value;

  const { activeId, keys } = loadKeyring();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, keys.get(activeId)!, iv);
  // The key id is authenticated too, so it cannot be swapped to point at another key.
  cipher.setAAD(Buffer.from(activeId, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);

  return [
    "enc",
    activeId,
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(":");
}

/**
 * Decrypt a value made by {@link encryptField}. Plain values (not yet migrated) are returned
 * as they are. A value that is marked encrypted but cannot be decrypted THROWS: returning
 * null would let callers treat the field as empty and save that over the real data.
 */
export function decryptField<T>(value: T): T | string {
  if (!isEncrypted(value)) return value;

  const parts = value.split(":");
  if (parts.length !== 5) throw new Error("Encrypted field is malformed");

  const [, keyId, iv, tag, data] = parts;
  const key = loadKeyring().keys.get(keyId);
  if (!key) throw new Error(`No encryption key configured for key id '${keyId}'`);

  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, "base64url"));
    decipher.setAAD(Buffer.from(keyId, "utf8"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    throw new Error(`Could not decrypt field with key id '${keyId}' (wrong key or corrupted data)`);
  }
}
