import { Request, Response, NextFunction } from "express";
import { DigiLockerRequest } from "../../middleware/digilocker.middleware";
import { digilockerModuleService } from "./digilocker.service";
import { digilockerConfig, renderCallbackPage } from "../../services/digilocker";
import {
  DigiLockerPurpose,
  DigiLockerSessionStatus,
  DigiLockerSubjectType,
} from "../../database/models/DigiLockerSession";
import { UnauthorizedError } from "../../utils/errors";

/**
 * Sandbox only. In live mode the redirect URI must match DigiLocker's
 * registration exactly, and the Host header is caller-controlled, so it must
 * never influence it. Behind a TLS-terminating proxy req.protocol is "http";
 * an http callback after the https consent page breaks the form's
 * `form-action 'self'`, so prefer PUBLIC_API_URL / X-Forwarded-Proto.
 */
export function getSandboxRequestOrigin(req: Request): string | undefined {
  if (!digilockerConfig.isSandbox) return undefined;
  return (
    process.env.PUBLIC_API_URL ||
    `${(req.headers["x-forwarded-proto"] as string)?.split(",")[0] || req.protocol}://${req.get("host")}`
  ).replace(/\/+$/, "");
}

/**
 * DigiLocker controllers.
 *
 * These are deliberately thin: the middleware stack has already proved the
 * caller has a usable grant, so each handler just calls the service and shapes
 * the response. Errors are passed to the global handler via next().
 */
export class DigiLockerController {
  /** POST /api/v1/digilocker/session — start the consent flow. */
  async startSession(req: DigiLockerRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError();

      const requestOrigin = getSandboxRequestOrigin(req);

      const result = await digilockerModuleService.startSession(userId, {
        purpose: (req.body?.purpose as DigiLockerPurpose) || undefined,
        persona: req.body?.persona,
        verifiedMobile: req.body?.verifiedMobile,
        clientRedirectUrl: req.body?.clientRedirectUrl,
        requestOrigin,
      });

      return res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/digilocker/callback — exchange the code from the client.
   *
   * This is the path mobile clients use: the app captures `code` + `state` from
   * the WebView redirect and posts them with its own JWT attached.
   */
  async exchangeCode(req: DigiLockerRequest, res: Response, next: NextFunction) {
    try {
      const session = req.digilockerPendingSession!;
      const result = await digilockerModuleService.completeConsent(session, req.body.code);

      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/digilocker/callback — the browser redirect target.
   *
   * DigiLocker redirects the user's browser here with no Authorization header,
   * so the unguessable single-use `state` is what binds the callback to the
   * session (already checked by verifyDigilockerState).
   *
   * Always answers with a readable HTML page, and bounces to a deep link when
   * DIGILOCKER_CLIENT_REDIRECT_URL is set so the app can close the WebView.
   */
  async handleRedirect(req: DigiLockerRequest, res: Response, _next: NextFunction) {
    const session = req.digilockerPendingSession!;
    // The partner website opens consent in a popup and polls for the result,
    // so its page closes itself rather than pointing back at an app.
    const fromWebsite = session.subjectType === DigiLockerSubjectType.VENDOR_ONBOARDING;
    const returnTo = fromWebsite ? "the partner onboarding form" : "the app";

    try {
      const { code, error, error_description: errorDescription } = req.query as Record<string, string>;

      // The user declined on DigiLocker's consent screen, or DigiLocker refused.
      if (error || !code) {
        session.status = DigiLockerSessionStatus.FAILED;
        session.lastError = errorDescription || error || "DigiLocker returned no authorization code";
        await session.save();

        return renderCallbackPage(res, {
          deepLink: session.clientRedirectUrl,
          closeWindow: fromWebsite,
          ok: false,
          title: "DigiLocker verification cancelled",
          detail:
            error === "access_denied"
              ? `You declined to share your documents. You can try again from ${returnTo}.`
              : session.lastError,
        });
      }

      await digilockerModuleService.completeConsent(session, code);

      return renderCallbackPage(res, {
        deepLink: session.clientRedirectUrl,
        closeWindow: fromWebsite,
        ok: true,
        title: "DigiLocker verification complete",
        detail: `You can close this window and return to ${returnTo}.`,
      });
    } catch (error: any) {
      // A browser landed here, so answer with a page rather than a JSON error.
      return renderCallbackPage(res, {
        deepLink: session?.clientRedirectUrl,
        closeWindow: fromWebsite,
        ok: false,
        title: "DigiLocker verification failed",
        detail: error?.message || `Something went wrong. Please try again from ${returnTo}.`,
      });
    }
  }

  /** GET /api/v1/digilocker/status — is this user linked, and to what. */
  async status(req: DigiLockerRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError();

      const result = await digilockerModuleService.getStatus(userId);
      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/digilocker/documents — list issued documents. */
  async listDocuments(req: DigiLockerRequest, res: Response, next: NextFunction) {
    try {
      const { session, accessToken } = req.digilocker!;
      const result = await digilockerModuleService.listDocuments(session, accessToken);

      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/digilocker/documents/:uri — download one document. */
  async getDocument(req: DigiLockerRequest, res: Response, next: NextFunction) {
    try {
      const { session, accessToken } = req.digilocker!;
      const format = ((req.query.format as string) || "pdf") as "pdf" | "xml";
      const uri = String(req.params.uri);

      const document = await digilockerModuleService.getDocument(session, accessToken, uri, format);

      const disposition = req.query.download === "1" ? "attachment" : "inline";
      res.setHeader("Content-Type", document.mime);
      res.setHeader(
        "Content-Disposition",
        `${disposition}; filename="${document.fileName || "document"}"`
      );
      // Identity documents must never be cached by a proxy or the browser.
      res.setHeader("Cache-Control", "no-store, private");

      return res.send(document.content);
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/digilocker/aadhaar — normalised Aadhaar KYC. */
  async getAadhaar(req: DigiLockerRequest, res: Response, next: NextFunction) {
    try {
      const { session, accessToken } = req.digilocker!;
      const result = await digilockerModuleService.getAadhaar(session, accessToken);

      res.setHeader("Cache-Control", "no-store, private");
      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/digilocker/pan — normalised PAN details. */
  async getPan(req: DigiLockerRequest, res: Response, next: NextFunction) {
    try {
      const { session, accessToken } = req.digilocker!;
      const result = await digilockerModuleService.getPan(session, accessToken);

      res.setHeader("Cache-Control", "no-store, private");
      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/digilocker/licence — normalised driving licence. */
  async getDrivingLicence(req: DigiLockerRequest, res: Response, next: NextFunction) {
    try {
      const { session, accessToken } = req.digilocker!;
      const result = await digilockerModuleService.getDrivingLicence(session, accessToken);

      res.setHeader("Cache-Control", "no-store, private");
      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/digilocker/sync — write verified identity onto the Driver. */
  async syncToDriver(req: DigiLockerRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { session, accessToken } = req.digilocker!;

      const result = await digilockerModuleService.syncToDriver(userId, session, accessToken);
      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/digilocker/refresh — force an access-token refresh. */
  async refresh(req: DigiLockerRequest, res: Response, next: NextFunction) {
    try {
      const { session } = req.digilocker!;
      const result = await digilockerModuleService.refresh(session);

      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /api/v1/digilocker/session — revoke and unlink. */
  async revoke(req: DigiLockerRequest, res: Response, next: NextFunction) {
    try {
      const { session } = req.digilocker!;
      const result = await digilockerModuleService.revoke(session);

      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/digilocker/sessions — this user's attempt history. */
  async listSessions(req: DigiLockerRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError();

      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const result = await digilockerModuleService.listSessions(userId, limit);

      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/digilocker/health — mode + configuration probe. */
  async health(_req: DigiLockerRequest, res: Response) {
    return res.json({
      success: true,
      mode: digilockerConfig.mode,
      sandbox: digilockerConfig.isSandbox,
      baseUrl: digilockerConfig.isSandbox ? digilockerConfig.sandboxAuthorizeUrl : digilockerConfig.baseUrl,
      redirectUri: digilockerConfig.redirectUri,
    });
  }
}

export const digilockerController = new DigiLockerController();
