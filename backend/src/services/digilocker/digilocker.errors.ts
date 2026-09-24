import { AppError } from "../../utils/errors";

/**
 * Raised when DigiLocker itself rejects a call. Carries the upstream status and
 * error code so callers can distinguish "user must re-consent" (401/invalid_grant)
 * from "DigiLocker is down" (5xx) without string-matching messages.
 */
export class DigiLockerApiError extends AppError {
  constructor(
    message: string,
    statusCode: number = 502,
    public readonly upstreamStatus?: number,
    public readonly upstreamCode?: string,
    public readonly details?: unknown
  ) {
    super(statusCode, message);
  }

  /** True when the stored grant is dead and the user has to re-authorise. */
  get requiresReconsent(): boolean {
    if (this.upstreamStatus === 401) return true;
    return ["invalid_grant", "invalid_token", "expired_token", "access_denied"].includes(
      (this.upstreamCode || "").toLowerCase()
    );
  }
}

/** Raised when the integration is switched off or missing credentials. */
export class DigiLockerNotConfiguredError extends AppError {
  constructor(message = "DigiLocker integration is not configured on this server") {
    super(503, message);
  }
}

/** Raised when a user has no usable DigiLocker grant and must run consent. */
export class DigiLockerSessionError extends AppError {
  constructor(message: string, statusCode: number = 428, public readonly reason?: string) {
    super(statusCode, message);
  }
}
