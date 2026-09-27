/**
 * Shared DigiLocker types.
 *
 * These mirror the DigiLocker Partner API (MeriPehchaan) response shapes, and
 * are the contract both the live HTTP provider and the sandbox provider
 * implement — so nothing above the provider layer knows which one is running.
 */

/** Which DigiLocker backend the service talks to. */
export type DigiLockerMode = "live" | "sandbox";

/** DigiLocker doctypes this integration knows how to normalise. */
export enum DigiLockerDocType {
  AADHAAR = "ADHAR",
  PAN = "PANCR",
  DRIVING_LICENCE = "DRVLC",
  VEHICLE_RC = "RCDL",
}

/** Params accepted when building the consent (authorize) URL. */
export interface AuthorizationUrlParams {
  state: string;
  codeChallenge: string;
  /** Optional DigiLocker hints — passed through when provided. */
  dlFlow?: "signin" | "signup";
  /** Authentication context: which identifier the user signs in with. */
  acr?: string;
  /** Pre-fills the mobile number on DigiLocker's sign-in screen. */
  verifiedMobile?: string;
  /** Partner transaction id, echoed back on the callback. */
  txn?: string;
  /** Sandbox-only: preselect a test persona. Ignored by the live provider. */
  persona?: string;
  /**
   * Sandbox-only: the origin the client actually reached us on, e.g.
   * "http://10.143.148.2:5000". Used instead of PUBLIC_BASE_URL so the consent
   * URL is reachable from whichever network the device is on. The live provider
   * ignores it — DigiLocker requires the registered redirect URI verbatim.
   */
  requestOrigin?: string;
}

/** Raw token payload returned by DigiLocker's /token endpoint. */
export interface DigiLockerTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  /** Unix seconds until the granted consent lapses. */
  consent_valid_till?: number | string;
  digilockerid?: string;
  name?: string;
  /** DigiLocker returns DDMMYYYY here. */
  dob?: string;
  gender?: string;
  /** "Y" when an eAadhaar is available for this account. */
  eaadhaar?: string;
  reference_key?: string;
  new_account?: string;
  [key: string]: unknown;
}

/** Normalised token bundle used everywhere above the provider. */
export interface DigiLockerTokenBundle {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  /** Absolute expiry, derived from `expires_in` at exchange time. */
  expiresAt: Date;
  scope: string[];
  consentValidTill?: Date;
  digilockerId?: string;
  name?: string;
  dob?: string;
  gender?: string;
  eaadhaarAvailable: boolean;
  referenceKey?: string;
  newAccount: boolean;
  raw: DigiLockerTokenResponse;
}

/** One entry from GET /files/issued. */
export interface DigiLockerIssuedDocument {
  name: string;
  /** Opaque document identifier used to fetch the file/XML. */
  uri: string;
  doctype: string;
  description?: string;
  issuer?: string;
  issuerId?: string;
  mime: string[];
  size?: string;
  date?: string;
}

/** A fetched document's bytes plus its content type. */
export interface DigiLockerDocumentContent {
  uri: string;
  mime: string;
  /** File bytes. For XML formats this is the UTF-8 XML document. */
  content: Buffer;
  fileName?: string;
}

/** Normalised Aadhaar KYC extracted from DigiLocker's eAadhaar XML. */
export interface DigiLockerAadhaarData {
  name?: string;
  dob?: string;
  gender?: string;
  /** Always masked — DigiLocker never returns the full 12 digits. */
  maskedAadhaarNumber?: string;
  careOf?: string;
  address?: {
    house?: string;
    street?: string;
    landmark?: string;
    locality?: string;
    vtc?: string;
    subDistrict?: string;
    district?: string;
    state?: string;
    pincode?: string;
    country?: string;
    full?: string;
  };
  photoBase64?: string;
  issuedAt?: string;
}

/** Normalised driving licence extracted from DigiLocker's transport-dept XML. */
export interface DigiLockerDrivingLicenceData {
  licenceNumber?: string;
  name?: string;
  dob?: string;
  /** Validity end date, normalised to DD-MM-YYYY. */
  validTill?: string;
  /** Vehicle classes the holder may drive, e.g. "LMV, MCWG". */
  vehicleClass?: string;
  issuedBy?: string;
  issuedAt?: string;
}

/** Normalised PAN details extracted from DigiLocker's PAN certificate. */
export interface DigiLockerPanData {
  panNumber?: string;
  name?: string;
  fatherName?: string;
  dob?: string;
  gender?: string;
  issuedAt?: string;
}

/**
 * The contract both providers satisfy. Adding a new backend (an aggregator,
 * say) means implementing this interface and registering it in the factory —
 * nothing in the routes/controllers/middleware needs to change.
 */
export interface IDigiLockerProvider {
  readonly mode: DigiLockerMode;

  /** Build the URL the user's browser/WebView opens to grant consent. */
  getAuthorizationUrl(params: AuthorizationUrlParams): string;

  /** Exchange a one-time authorization code (+ PKCE verifier) for tokens. */
  exchangeCodeForToken(code: string, codeVerifier: string): Promise<DigiLockerTokenBundle>;

  /** Trade a refresh token for a fresh access token. */
  refreshAccessToken(refreshToken: string): Promise<DigiLockerTokenBundle>;

  /** List the documents issued to the consenting user. */
  listIssuedDocuments(accessToken: string): Promise<DigiLockerIssuedDocument[]>;

  /** Download a single document by its URI. */
  getDocument(accessToken: string, uri: string, format?: "pdf" | "xml"): Promise<DigiLockerDocumentContent>;

  /** Fetch + normalise the user's eAadhaar. */
  getAadhaar(accessToken: string): Promise<DigiLockerAadhaarData>;

  /** Fetch + normalise the user's PAN certificate. */
  getPan(accessToken: string): Promise<DigiLockerPanData>;

  /** Fetch + normalise the user's driving licence. */
  getDrivingLicence(accessToken: string): Promise<DigiLockerDrivingLicenceData>;

  /** Best-effort token revocation at DigiLocker's end. */
  revokeToken(accessToken: string): Promise<void>;
}
