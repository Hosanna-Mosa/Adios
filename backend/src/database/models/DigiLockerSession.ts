import mongoose, { Schema, Document } from "mongoose";
import { decryptSecret, encryptSecret } from "../../utils/crypto";

/**
 * One DigiLocker consent session per attempt.
 *
 * Lifecycle: PENDING (consent URL issued) -> LINKED (code exchanged, tokens
 * held) -> REVOKED / EXPIRED / FAILED. A user may have many historical rows but
 * only one LINKED row at a time; the module service enforces that.
 *
 * OAuth secrets (access token, refresh token, PKCE verifier) are encrypted at
 * rest — use the helper methods below rather than touching the raw fields.
 */

export enum DigiLockerSessionStatus {
  PENDING = "pending",
  LINKED = "linked",
  FAILED = "failed",
  REVOKED = "revoked",
  EXPIRED = "expired",
}

/** Why the consent flow was started — drives what we sync afterwards. */
export enum DigiLockerPurpose {
  KYC = "kyc",
  AADHAAR = "aadhaar",
  PAN = "pan",
  DOCUMENTS = "documents",
}

export interface IDigiLockerDocumentRef {
  uri: string;
  doctype: string;
  name: string;
  issuer?: string;
  issuerId?: string;
  mime: string[];
  size?: string;
  date?: string;
}

export interface IDigiLockerSession extends Document {
  /** Mongoose `_id` virtual, as a hex string. */
  id: string;
  user: mongoose.Types.ObjectId;
  status: DigiLockerSessionStatus;
  purpose: DigiLockerPurpose;
  mode: "live" | "sandbox";

  // ── OAuth handshake ──
  state: string;
  codeVerifierEnc?: string | null;
  codeChallenge?: string;
  redirectUri: string;
  authUrl?: string;
  /**
   * Where the callback page bounces the client back to after consent.
   * Per-session because a dev build's deep link (exp://…) differs from a
   * release build's (flavour-driver://). Falls back to the configured default.
   */
  clientRedirectUrl?: string;

  // ── Granted credentials (encrypted) ──
  accessTokenEnc?: string | null;
  refreshTokenEnc?: string | null;
  tokenType?: string;
  scope: string[];
  accessTokenExpiresAt?: Date;
  consentValidTill?: Date;

  // ── DigiLocker account snapshot ──
  digilockerId?: string;
  holderName?: string;
  holderDob?: string;
  holderGender?: string;
  eaadhaarAvailable: boolean;
  sandboxPersona?: string;

  // ── Cached results ──
  documents: IDigiLockerDocumentRef[];
  documentsFetchedAt?: Date;
  aadhaarData?: Record<string, any>;
  aadhaarFetchedAt?: Date;
  panData?: Record<string, any>;
  panFetchedAt?: Date;
  drivingLicenceData?: Record<string, any>;
  drivingLicenceFetchedAt?: Date;
  syncedToDriverAt?: Date;

  // ── Diagnostics ──
  lastError?: string;
  linkedAt?: Date;
  revokedAt?: Date;
  /** Set only while PENDING; drives the TTL sweep. Cleared once linked. */
  expiresAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;

  // ── Helpers ──
  setAccessToken(token?: string | null): void;
  getAccessToken(): string | null;
  setRefreshToken(token?: string | null): void;
  getRefreshToken(): string | null;
  setCodeVerifier(verifier?: string | null): void;
  getCodeVerifier(): string | null;
  isAccessTokenExpired(leewaySeconds?: number): boolean;
  isConsentExpired(): boolean;
}

const DocumentRefSchema = new Schema<IDigiLockerDocumentRef>(
  {
    uri: { type: String, required: true },
    doctype: { type: String, default: "" },
    name: { type: String, default: "" },
    issuer: { type: String },
    issuerId: { type: String },
    mime: { type: [String], default: [] },
    size: { type: String },
    date: { type: String },
  },
  { _id: false }
);

const DigiLockerSessionSchema = new Schema<IDigiLockerSession>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: Object.values(DigiLockerSessionStatus),
      default: DigiLockerSessionStatus.PENDING,
      index: true,
    },
    purpose: {
      type: String,
      enum: Object.values(DigiLockerPurpose),
      default: DigiLockerPurpose.KYC,
    },
    mode: { type: String, enum: ["live", "sandbox"], required: true },

    state: { type: String, required: true, unique: true },
    codeVerifierEnc: { type: String, default: null },
    codeChallenge: { type: String },
    redirectUri: { type: String, required: true },
    authUrl: { type: String },
    clientRedirectUrl: { type: String },

    accessTokenEnc: { type: String, default: null },
    refreshTokenEnc: { type: String, default: null },
    tokenType: { type: String, default: "Bearer" },
    scope: { type: [String], default: [] },
    accessTokenExpiresAt: { type: Date },
    consentValidTill: { type: Date },

    digilockerId: { type: String, index: true },
    holderName: { type: String },
    holderDob: { type: String },
    holderGender: { type: String },
    eaadhaarAvailable: { type: Boolean, default: false },
    sandboxPersona: { type: String },

    documents: { type: [DocumentRefSchema], default: [] },
    documentsFetchedAt: { type: Date },
    aadhaarData: { type: Schema.Types.Mixed },
    aadhaarFetchedAt: { type: Date },
    panData: { type: Schema.Types.Mixed },
    panFetchedAt: { type: Date },
    drivingLicenceData: { type: Schema.Types.Mixed },
    drivingLicenceFetchedAt: { type: Date },
    syncedToDriverAt: { type: Date },

    lastError: { type: String },
    linkedAt: { type: Date },
    revokedAt: { type: Date },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Fast lookup of "the user's current grant".
DigiLockerSessionSchema.index({ user: 1, status: 1, createdAt: -1 });

// TTL sweep for abandoned consent attempts. Mongo ignores documents where the
// indexed field is absent or null, so clearing `expiresAt` on a successful link
// is what keeps a live grant from being deleted out from under the user.
DigiLockerSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

DigiLockerSessionSchema.methods.setAccessToken = function (token?: string | null) {
  this.accessTokenEnc = encryptSecret(token);
};

DigiLockerSessionSchema.methods.getAccessToken = function (): string | null {
  return decryptSecret(this.accessTokenEnc);
};

DigiLockerSessionSchema.methods.setRefreshToken = function (token?: string | null) {
  this.refreshTokenEnc = encryptSecret(token);
};

DigiLockerSessionSchema.methods.getRefreshToken = function (): string | null {
  return decryptSecret(this.refreshTokenEnc);
};

DigiLockerSessionSchema.methods.setCodeVerifier = function (verifier?: string | null) {
  this.codeVerifierEnc = encryptSecret(verifier);
};

DigiLockerSessionSchema.methods.getCodeVerifier = function (): string | null {
  return decryptSecret(this.codeVerifierEnc);
};

/**
 * True when the access token is gone, or expires within `leewaySeconds`.
 * The leeway stops us handing a token to DigiLocker that dies mid-request.
 */
DigiLockerSessionSchema.methods.isAccessTokenExpired = function (leewaySeconds = 0): boolean {
  if (!this.accessTokenEnc || !this.accessTokenExpiresAt) return true;
  return this.accessTokenExpiresAt.getTime() - leewaySeconds * 1000 <= Date.now();
};

/** True when the user's consent grant itself has lapsed (needs full re-consent). */
DigiLockerSessionSchema.methods.isConsentExpired = function (): boolean {
  if (!this.consentValidTill) return false;
  return this.consentValidTill.getTime() <= Date.now();
};

/** Never leak encrypted OAuth material through a JSON response. */
DigiLockerSessionSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    delete ret.accessTokenEnc;
    delete ret.refreshTokenEnc;
    delete ret.codeVerifierEnc;
    return ret;
  },
});

export default mongoose.model<IDigiLockerSession>("DigiLockerSession", DigiLockerSessionSchema);
