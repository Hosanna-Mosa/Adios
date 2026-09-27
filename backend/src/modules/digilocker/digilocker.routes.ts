import { Router, urlencoded } from "express";
import { authenticateToken } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import {
  digilockerRateLimit,
  digilockerSessionRateLimit,
  verifyDigilockerEnabled,
  verifyDigilockerSession,
  verifyDigilockerState,
  verifySandboxMode,
} from "../../middleware/digilocker.middleware";
import { digilockerController } from "./digilocker.controller";
import { digilockerSandboxController } from "./digilocker.sandbox.controller";
import {
  callbackQuerySchema,
  exchangeCodeSchema,
  getDocumentSchema,
  listSessionsSchema,
  sandboxAuthorizeQuerySchema,
  sandboxDecisionSchema,
  startSessionSchema,
} from "./digilocker.validation";
import { digilockerConfig } from "../../services/digilocker";

/**
 * DigiLocker routes — /api/v1/digilocker
 *
 * Every route carries `verifyDigilockerEnabled` plus a rate limiter, and every
 * route that actually touches DigiLocker data additionally carries
 * `verifyDigilockerSession`, which guarantees a live, non-expired, auto-refreshed
 * grant before the controller runs.
 *
 *   POST   /session              start consent            auth + enabled + sessionLimit
 *   GET    /callback             browser redirect target  enabled + limit + state
 *   POST   /callback             app-driven code exchange auth + enabled + limit + state
 *   GET    /status               link status              auth + enabled + limit
 *   GET    /sessions             attempt history          auth + enabled + limit
 *   GET    /documents            issued documents         auth + enabled + limit + session
 *   GET    /documents/:uri       download one document    auth + enabled + limit + session
 *   GET    /aadhaar              normalised Aadhaar KYC   auth + enabled + limit + session
 *   GET    /pan                  normalised PAN details   auth + enabled + limit + session
 *   GET    /licence              normalised driving licence auth + enabled + limit + session
 *   POST   /sync                 write KYC onto Driver    auth + enabled + limit + session
 *   POST   /refresh              force token refresh      auth + enabled + limit + session*
 *   DELETE /session              revoke + unlink          auth + enabled + limit + session*
 *   GET    /health               mode probe               auth + enabled
 *
 *   (*) these two accept an expired access token, since they must still work
 *       on a grant that has already gone stale.
 */

const router = Router();

// Guard 1 on every single route below: a misconfigured integration answers 503
// and tags each response with the active mode.
router.use(verifyDigilockerEnabled);

// ── Sandbox authorization server (mounted only in sandbox mode) ──
// Declared before the authenticated routes because DigiLocker's consent screen
// is reached by a browser redirect that carries no JWT.
if (digilockerConfig.isSandbox) {
  const sandbox = Router();

  sandbox.use(verifySandboxMode);
  // The consent screen posts a normal HTML form; the app itself is JSON-only.
  sandbox.use(urlencoded({ extended: false }));

  sandbox.get(
    "/authorize",
    digilockerRateLimit,
    validateRequest(sandboxAuthorizeQuerySchema),
    digilockerSandboxController.renderConsent.bind(digilockerSandboxController)
  );

  sandbox.post(
    "/authorize",
    digilockerRateLimit,
    validateRequest(sandboxDecisionSchema),
    digilockerSandboxController.submitConsent.bind(digilockerSandboxController)
  );

  sandbox.get(
    "/personas",
    digilockerRateLimit,
    digilockerSandboxController.listPersonas.bind(digilockerSandboxController)
  );

  router.use("/sandbox", sandbox);
}

// ── OAuth callback ──
// GET is the browser redirect from DigiLocker: no Authorization header exists,
// so the single-use unguessable `state` is the binding (verifyDigilockerState).
router.get(
  "/callback",
  digilockerRateLimit,
  validateRequest(callbackQuerySchema),
  verifyDigilockerState({ html: true }),
  digilockerController.handleRedirect.bind(digilockerController)
);

// POST is the app-driven exchange: the client posts code + state with its JWT,
// so this one is additionally bound to the authenticated user.
router.post(
  "/callback",
  authenticateToken,
  digilockerRateLimit,
  validateRequest(exchangeCodeSchema),
  verifyDigilockerState(),
  digilockerController.exchangeCode.bind(digilockerController)
);

// ── Everything below requires our own authentication ──
router.use(authenticateToken);

router.get("/health", digilockerRateLimit, digilockerController.health.bind(digilockerController));

router.post(
  "/session",
  digilockerSessionRateLimit,
  validateRequest(startSessionSchema),
  digilockerController.startSession.bind(digilockerController)
);

router.get("/status", digilockerRateLimit, digilockerController.status.bind(digilockerController));

router.get(
  "/sessions",
  digilockerRateLimit,
  validateRequest(listSessionsSchema),
  digilockerController.listSessions.bind(digilockerController)
);

// ── Routes that read DigiLocker data: all gated by verifyDigilockerSession ──

router.get(
  "/documents",
  digilockerRateLimit,
  verifyDigilockerSession(),
  digilockerController.listDocuments.bind(digilockerController)
);

router.get(
  "/documents/:uri",
  digilockerRateLimit,
  validateRequest(getDocumentSchema),
  verifyDigilockerSession(),
  digilockerController.getDocument.bind(digilockerController)
);

router.get(
  "/aadhaar",
  digilockerRateLimit,
  verifyDigilockerSession(),
  digilockerController.getAadhaar.bind(digilockerController)
);

router.get(
  "/pan",
  digilockerRateLimit,
  verifyDigilockerSession(),
  digilockerController.getPan.bind(digilockerController)
);

// Both spellings, so clients aren't tripped up by British/American English.
router.get(
  ["/licence", "/license"],
  digilockerRateLimit,
  verifyDigilockerSession(),
  digilockerController.getDrivingLicence.bind(digilockerController)
);

router.post(
  "/sync",
  digilockerRateLimit,
  verifyDigilockerSession(),
  digilockerController.syncToDriver.bind(digilockerController)
);

// Refresh and revoke must work on a grant whose access token has already died,
// so they opt out of the freshness check and handle the stale token themselves.
router.post(
  "/refresh",
  digilockerRateLimit,
  verifyDigilockerSession({ allowExpiredToken: true }),
  digilockerController.refresh.bind(digilockerController)
);

router.delete(
  "/session",
  digilockerRateLimit,
  verifyDigilockerSession({ allowExpiredToken: true }),
  digilockerController.revoke.bind(digilockerController)
);

export default router;
