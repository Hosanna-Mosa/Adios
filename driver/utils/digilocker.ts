/**
 * DigiLocker API client.
 *
 * Thin typed wrapper over the backend's /api/v1/digilocker endpoints. The app
 * never talks to DigiLocker itself and never holds DigiLocker credentials —
 * the backend owns the OAuth handshake, and this file just drives it.
 *
 * Backend failures arrive with a machine-readable `code`, which is surfaced
 * here as {@link DigiLockerError} so screens can branch on the cause rather
 * than string-matching messages.
 */

import { API_URL } from "@/utils/apiUrl";

/** Error codes the backend returns. See backend/DIGILOCKER.md. */
export type DigiLockerErrorCode =
  | "DIGILOCKER_DISABLED"
  | "DIGILOCKER_NOT_LINKED"
  | "DIGILOCKER_CONSENT_EXPIRED"
  | "DIGILOCKER_TOKEN_REFRESH_FAILED"
  | "DIGILOCKER_INVALID_STATE"
  | "DIGILOCKER_SCOPE_MISSING"
  | "DIGILOCKER_RATE_LIMITED"
  | "document_not_issued"
  | "UNKNOWN";

export class DigiLockerError extends Error {
  constructor(
    message: string,
    public readonly code: DigiLockerErrorCode,
    public readonly status: number,
    /** Present when re-running consent is the fix. */
    public readonly action?: string
  ) {
    super(message);
    this.name = "DigiLockerError";
  }

  /** True when the driver needs to (re-)authorise before this can work. */
  get needsConsent(): boolean {
    return (
      this.action === "START_DIGILOCKER_CONSENT" ||
      this.code === "DIGILOCKER_NOT_LINKED" ||
      this.code === "DIGILOCKER_CONSENT_EXPIRED" ||
      this.code === "DIGILOCKER_TOKEN_REFRESH_FAILED"
    );
  }

  /** True when the document simply is not in the driver's DigiLocker. */
  get documentMissing(): boolean {
    return this.code === "document_not_issued" || this.status === 404;
  }
}

async function request<T>(
  path: string,
  token: string,
  init: RequestInit = {}
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/digilocker${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    });
  } catch {
    throw new DigiLockerError(
      "Could not reach the server. Check your connection and try again.",
      "UNKNOWN",
      0
    );
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new DigiLockerError(
      body?.message || "Something went wrong. Please try again.",
      (body?.code as DigiLockerErrorCode) || "UNKNOWN",
      response.status,
      body?.action
    );
  }

  return body as T;
}

// ── Response shapes ──────────────────────────────────────────────────────────

export interface DigiLockerAccount {
  digilockerId?: string;
  name?: string;
  dob?: string;
  gender?: string;
  eaadhaarAvailable?: boolean;
}

export interface DigiLockerStatus {
  success: boolean;
  linked: boolean;
  /** "sandbox" means simulated documents — the UI must say so. */
  mode: "live" | "sandbox";
  sandbox: boolean;
  status: string | null;
  linkedAt?: string;
  consentValidTill?: string;
  account?: DigiLockerAccount;
  syncedToDriverAt?: string;
  lastError?: string | null;
}

export interface DigiLockerSessionStart {
  success: boolean;
  sessionId: string;
  state: string;
  /** The URL to open for consent. */
  authUrl: string;
  mode: "live" | "sandbox";
  sandbox: boolean;
  expiresAt: string;
}

export interface AadhaarData {
  name?: string;
  dob?: string;
  gender?: string;
  /** Always masked, e.g. XXXXXXXX4321. */
  maskedAadhaarNumber?: string;
  careOf?: string;
  address?: { full?: string; state?: string; pincode?: string };
}

export interface PanData {
  panNumber?: string;
  name?: string;
  fatherName?: string;
  dob?: string;
}

export interface DrivingLicenceData {
  licenceNumber?: string;
  name?: string;
  dob?: string;
  /** DD-MM-YYYY. */
  validTill?: string;
  /** e.g. "LMV, MCWG". */
  vehicleClass?: string;
  issuedBy?: string;
}

export interface SyncResult {
  success: boolean;
  synced: boolean;
  updatedFields: string[];
  /** Documents the driver does not have issued, e.g. ["pan"]. */
  skipped: string[];
  driver: {
    aadhaarNumber?: string;
    aadhaarVerified?: boolean;
    panNumber?: string;
    panVerified?: boolean;
    dlNumber?: string;
    dlVerified?: boolean;
    dlExpiry?: string;
    dlVehicleClass?: string;
    gender?: string;
    onboardingStatus?: string;
  };
  sandbox: boolean;
}

// ── Endpoints ────────────────────────────────────────────────────────────────

/** Is this driver's DigiLocker linked, and to which account. */
export function getStatus(token: string) {
  return request<DigiLockerStatus>("/status", token);
}

/**
 * Begin a consent flow. Returns the URL to open in a browser.
 * The backend generates the PKCE pair and remembers the session.
 */
export function startSession(
  token: string,
  options: { purpose?: string; clientRedirectUrl?: string } = {}
) {
  return request<DigiLockerSessionStart>("/session", token, {
    method: "POST",
    body: JSON.stringify({
      purpose: options.purpose || "kyc",
      // Tells the backend which deep link to bounce back to. A dev build's
      // scheme (exp://) differs from a release build's (flavour-driver://),
      // so it has to come from the running app rather than server config.
      ...(options.clientRedirectUrl ? { clientRedirectUrl: options.clientRedirectUrl } : {}),
    }),
  });
}

/** Aadhaar KYC from the linked account. Throws if not linked. */
export function getAadhaar(token: string) {
  return request<{ data: AadhaarData; mode: string }>("/aadhaar", token);
}

/** PAN details from the linked account. Throws if not linked or not issued. */
export function getPan(token: string) {
  return request<{ data: PanData; mode: string }>("/pan", token);
}

/** Driving licence from the linked account. Throws if not linked or not issued. */
export function getDrivingLicence(token: string) {
  return request<{ data: DrivingLicenceData; mode: string }>("/licence", token);
}

/** Copy the verified identity onto the driver record. */
export function syncToDriver(token: string) {
  return request<SyncResult>("/sync", token, { method: "POST" });
}

/** Revoke the grant and unlink. */
export function unlink(token: string) {
  return request<{ revoked: boolean }>("/session", token, { method: "DELETE" });
}

/** Whether DigiLocker is switched on server-side, and in which mode. */
export function getHealth(token: string) {
  return request<{ mode: "live" | "sandbox"; sandbox: boolean }>("/health", token);
}
