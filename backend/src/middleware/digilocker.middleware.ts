import { Response, NextFunction } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { AuthRequest } from "./auth.middleware";
import DigiLockerSession, {
  DigiLockerSessionStatus,
  IDigiLockerSession,
} from "../database/models/DigiLockerSession";
import {
  DigiLockerApiError,
  digilockerConfig,
  digilockerProvider,
  isDigilockerConfigured,
  renderCallbackPage,
} from "../services/digilocker";

/**
 * DigiLocker middleware.
 *
 * Every DigiLocker route runs through this stack, so controllers never have to
 * think about grants, token freshness or consent validity — by the time a
 * handler executes, `req.digilocker.accessToken` is guaranteed usable.
 *
 * Failure modes are distinguished by a machine-readable `code` so the driver
 * app can react correctly:
 *   DIGILOCKER_DISABLED         503 — integration not configured on the server
 *   DIGILOCKER_NOT_LINKED       428 — user has never completed consent
 *   DIGILOCKER_CONSENT_EXPIRED  428 — grant lapsed, re-run the consent flow
 *   DIGILOCKER_TOKEN_REFRESH_FAILED 428 — refresh rejected, re-run consent
 *   DIGILOCKER_INVALID_STATE    400 — callback state unknown/expired/replayed
 *   DIGILOCKER_SCOPE_MISSING    403 — grant lacks a required scope
 *
 * 428 (Precondition Required) is used throughout for "you must (re-)consent
 * first", keeping it distinct from the 401 that means the app's own JWT is bad.
 */

/** What the middleware stack attaches for downstream handlers. */
export interface DigiLockerContext {
  session: IDigiLockerSession;
  accessToken: string;
  mode: "live" | "sandbox";
  /** True when this request refreshed the access token. */
  refreshed: boolean;
}

export interface DigiLockerRequest extends AuthRequest {
  digilocker?: DigiLockerContext;
  /** Set by verifyDigilockerState on the OAuth callback. */
  digilockerPendingSession?: IDigiLockerSession;
}

interface DigiLockerFailure {
  status: number;
  code: string;
  message: string;
  action?: string;
}

function fail(res: Response, failure: DigiLockerFailure) {
  return res.status(failure.status).json({
    success: false,
    code: failure.code,
    message: failure.message,
    ...(failure.action ? { action: failure.action } : {}),
  });
}

/**
 * Guard 1 — the integration is switched on and usable.
 * Runs first on every DigiLocker route so a misconfigured server answers with
 * a clear 503 instead of failing deeper with a confusing error.
 */
export const verifyDigilockerEnabled = (req: DigiLockerRequest, res: Response, next: NextFunction) => {
  if (!isDigilockerConfigured()) {
    return fail(res, {
      status: 503,
      code: "DIGILOCKER_DISABLED",
      message:
        "DigiLocker is not configured on this server. Set DIGILOCKER_CLIENT_ID and " +
        "DIGILOCKER_CLIENT_SECRET, or run with DIGILOCKER_MODE=sandbox.",
    });
  }

  // Surfaced on every response so clients can show a "test mode" badge and
  // never mistake simulated KYC for the real thing.
  res.setHeader("X-DigiLocker-Mode", digilockerConfig.mode);
  next();
};

/** Key rate limits by authenticated user, falling back to IP for anonymous hits. */
const userOrIpKey = (req: AuthRequest): string =>
  req.user?.userId ? `user:${req.user.userId}` : `ip:${ipKeyGenerator(req.ip || "")}`;

/** Guard 2 — throttle DigiLocker document/API traffic per user. */
export const digilockerRateLimit = rateLimit({
  windowMs: digilockerConfig.rateLimitWindowMs,
  limit: digilockerConfig.rateLimitMax,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  handler: (_req, res) =>
    fail(res, {
      status: 429,
      code: "DIGILOCKER_RATE_LIMITED",
      message: "Too many DigiLocker requests. Please wait a moment and try again.",
    }),
});

/**
 * Stricter limit for starting a consent flow. Each start mints a session row
 * and an authorization URL, so it is far more expensive than a read.
 */
export const digilockerSessionRateLimit = rateLimit({
  windowMs: digilockerConfig.sessionRateLimitWindowMs,
  limit: digilockerConfig.sessionRateLimitMax,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  handler: (_req, res) =>
    fail(res, {
      status: 429,
      code: "DIGILOCKER_RATE_LIMITED",
      message:
        "Too many DigiLocker verification attempts. Please wait a few minutes before trying again.",
    }),
});

export interface VerifySessionOptions {
  /**
   * Skip the token-freshness check and hand over whatever is stored.
   * Used by /revoke and /unlink, which must work even on a dead grant.
   */
  allowExpiredToken?: boolean;
  /** Scopes the grant must carry for this route. */
  requiredScopes?: string[];
}

/** Mark a grant unusable and persist why, so support can see what happened. */
async function invalidate(
  session: IDigiLockerSession,
  status: DigiLockerSessionStatus,
  reason: string
): Promise<void> {
  session.status = status;
  session.lastError = reason;
  session.setAccessToken(null);
  session.setRefreshToken(null);
  await session.save();
}

/**
 * Guard 3 — the core verifier.
 *
 * Loads the caller's active grant, proves it is still usable, transparently
 * refreshes an access token that is expired or about to expire, and attaches
 * the result to the request.
 */
export const verifyDigilockerSession = (options: VerifySessionOptions = {}) => {
  return async (req: DigiLockerRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return fail(res, {
          status: 401,
          code: "UNAUTHENTICATED",
          message: "Authentication required",
        });
      }

      const session = await DigiLockerSession.findOne({
        user: userId,
        status: DigiLockerSessionStatus.LINKED,
      }).sort({ linkedAt: -1, createdAt: -1 });

      if (!session) {
        return fail(res, {
          status: 428,
          code: "DIGILOCKER_NOT_LINKED",
          message: "Your DigiLocker account is not linked yet. Complete DigiLocker consent first.",
          action: "START_DIGILOCKER_CONSENT",
        });
      }

      // A grant issued under a different mode is not portable — sandbox tokens
      // are meaningless to live DigiLocker and vice versa.
      if (session.mode !== digilockerConfig.mode) {
        await invalidate(
          session,
          DigiLockerSessionStatus.EXPIRED,
          `Grant was issued in ${session.mode} mode but the server now runs in ${digilockerConfig.mode} mode`
        );
        return fail(res, {
          status: 428,
          code: "DIGILOCKER_CONSENT_EXPIRED",
          message: "This DigiLocker link is no longer valid on this server. Please link again.",
          action: "START_DIGILOCKER_CONSENT",
        });
      }

      if (session.isConsentExpired()) {
        await invalidate(session, DigiLockerSessionStatus.EXPIRED, "Consent validity lapsed");
        return fail(res, {
          status: 428,
          code: "DIGILOCKER_CONSENT_EXPIRED",
          message: "Your DigiLocker consent has expired. Please authorise access again.",
          action: "START_DIGILOCKER_CONSENT",
        });
      }

      let accessToken = session.getAccessToken();
      let refreshed = false;

      const needsRefresh = session.isAccessTokenExpired(digilockerConfig.tokenRefreshLeewaySeconds);

      if (needsRefresh && !options.allowExpiredToken) {
        const refreshToken = session.getRefreshToken();

        if (!refreshToken) {
          await invalidate(
            session,
            DigiLockerSessionStatus.EXPIRED,
            "Access token expired and no refresh token was stored"
          );
          return fail(res, {
            status: 428,
            code: "DIGILOCKER_CONSENT_EXPIRED",
            message: "Your DigiLocker session has expired. Please authorise access again.",
            action: "START_DIGILOCKER_CONSENT",
          });
        }

        try {
          const bundle = await digilockerProvider.refreshAccessToken(refreshToken);

          session.setAccessToken(bundle.accessToken);
          if (bundle.refreshToken) session.setRefreshToken(bundle.refreshToken);
          session.accessTokenExpiresAt = bundle.expiresAt;
          session.tokenType = bundle.tokenType;
          if (bundle.scope.length) session.scope = bundle.scope;
          if (bundle.consentValidTill) session.consentValidTill = bundle.consentValidTill;
          session.lastError = undefined;
          await session.save();

          accessToken = bundle.accessToken;
          refreshed = true;
        } catch (error: any) {
          const reason =
            error instanceof DigiLockerApiError
              ? error.message
              : error?.message || "Token refresh failed";

          await invalidate(session, DigiLockerSessionStatus.EXPIRED, reason);

          return fail(res, {
            status: 428,
            code: "DIGILOCKER_TOKEN_REFRESH_FAILED",
            message: "Could not renew your DigiLocker session. Please authorise access again.",
            action: "START_DIGILOCKER_CONSENT",
          });
        }
      }

      if (!accessToken && !options.allowExpiredToken) {
        await invalidate(session, DigiLockerSessionStatus.EXPIRED, "No access token stored");
        return fail(res, {
          status: 428,
          code: "DIGILOCKER_NOT_LINKED",
          message: "Your DigiLocker account is not linked yet. Complete DigiLocker consent first.",
          action: "START_DIGILOCKER_CONSENT",
        });
      }

      const required = options.requiredScopes || [];
      if (required.length && session.scope.length) {
        const missing = required.filter((scope) => !session.scope.includes(scope));
        if (missing.length) {
          return fail(res, {
            status: 403,
            code: "DIGILOCKER_SCOPE_MISSING",
            message: `Your DigiLocker consent does not cover: ${missing.join(", ")}.`,
            action: "START_DIGILOCKER_CONSENT",
          });
        }
      }

      req.digilocker = {
        session,
        accessToken: accessToken || "",
        mode: session.mode,
        refreshed,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Guard 4 — validate the OAuth callback before any code is exchanged.
 *
 * Checks the `state` parameter against a PENDING session: this is the CSRF
 * defence for the consent flow, and it is also what stops a leaked code from
 * being replayed, since a session that has already been consumed is no longer
 * PENDING.
 */
export const verifyDigilockerState = (options: { html?: boolean } = {}) => {
  /**
   * On the browser-redirect route a JSON body would be shown to a person as raw
   * text, so failures there are rendered as a readable page instead.
   */
  const reject = (res: Response, failure: DigiLockerFailure) =>
    options.html
      ? renderCallbackPage(res, {
          ok: false,
          title: "DigiLocker verification failed",
          detail: failure.message,
          status: failure.status,
        })
      : fail(res, failure);

  return async (req: DigiLockerRequest, res: Response, next: NextFunction) => {
    try {
      const state = (req.body?.state || req.query?.state) as string | undefined;

      if (!state) {
        return reject(res, {
          status: 400,
          code: "DIGILOCKER_INVALID_STATE",
          message: "Missing DigiLocker state parameter.",
        });
      }

      const session = await DigiLockerSession.findOne({ state });

      if (!session) {
        return reject(res, {
          status: 400,
          code: "DIGILOCKER_INVALID_STATE",
          message: "This DigiLocker verification link is not recognised. Please start again.",
          action: "START_DIGILOCKER_CONSENT",
        });
      }

      if (session.status !== DigiLockerSessionStatus.PENDING) {
        return reject(res, {
          status: 400,
          code: "DIGILOCKER_INVALID_STATE",
          message: "This DigiLocker verification link has already been used. Please start again.",
          action: "START_DIGILOCKER_CONSENT",
        });
      }

      if (session.expiresAt && session.expiresAt.getTime() <= Date.now()) {
        session.status = DigiLockerSessionStatus.EXPIRED;
        session.lastError = "Consent window expired before the callback arrived";
        await session.save();

        return reject(res, {
          status: 400,
          code: "DIGILOCKER_INVALID_STATE",
          message: "This DigiLocker verification link has expired. Please start again.",
          action: "START_DIGILOCKER_CONSENT",
        });
      }

      // When the caller is authenticated, the grant must be theirs. The browser
      // redirect from DigiLocker carries no Authorization header, so the state
      // itself is the binding in that case — it is unguessable and single-use.
      if (req.user?.userId && session.user.toString() !== req.user.userId) {
        return reject(res, {
          status: 403,
          code: "DIGILOCKER_INVALID_STATE",
          message: "This DigiLocker verification belongs to a different account.",
        });
      }

      req.digilockerPendingSession = session;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/** Guard 5 — sandbox-only routes must never answer in live mode. */
export const verifySandboxMode = (_req: DigiLockerRequest, res: Response, next: NextFunction) => {
  if (!digilockerConfig.isSandbox) {
    return fail(res, {
      status: 404,
      code: "DIGILOCKER_SANDBOX_DISABLED",
      message: "The DigiLocker sandbox is not available in live mode.",
    });
  }
  next();
};

/**
 * Convenience stack for a route that needs an active, verified DigiLocker grant.
 * Compose as `...requireDigilocker()` after `authenticateToken`.
 */
export const requireDigilocker = (options: VerifySessionOptions = {}) => [
  verifyDigilockerEnabled,
  digilockerRateLimit,
  verifyDigilockerSession(options),
];
