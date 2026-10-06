import { Request, Response, NextFunction } from "express";
import DigiLockerSession, {
  DigiLockerSessionStatus,
  IDigiLockerSession,
} from "../../database/models/DigiLockerSession";
import { digilockerSandbox, SANDBOX_PERSONAS, getPersona, setDigilockerPageCsp } from "../../services/digilocker";
import { buildIssuedDocuments } from "../../services/digilocker/digilocker.personas";
import { AppError } from "../../utils/errors";

/**
 * The sandbox authorization server's user-facing half.
 *
 * This stands in for DigiLocker's hosted consent screen: it renders a real
 * page, the tester picks a persona and approves or denies, and it redirects
 * back to the configured redirect_uri with `code` + `state` (or an `error`)
 * exactly as DigiLocker would. Only mounted when DIGILOCKER_MODE=sandbox.
 */

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Resolve the PENDING session behind a state value, or explain why it failed. */
async function resolvePendingSession(state: string): Promise<IDigiLockerSession> {
  const session = await DigiLockerSession.findOne({ state });

  if (!session) {
    throw new AppError(400, "Unknown DigiLocker state. Start the verification from the app again.");
  }

  if (session.status !== DigiLockerSessionStatus.PENDING) {
    throw new AppError(
      400,
      "This DigiLocker consent link has already been used. Start the verification again."
    );
  }

  if (session.expiresAt && session.expiresAt.getTime() <= Date.now()) {
    session.status = DigiLockerSessionStatus.EXPIRED;
    session.lastError = "Consent window expired before approval";
    await session.save();
    throw new AppError(400, "This DigiLocker consent link has expired. Start the verification again.");
  }

  return session;
}

export class DigiLockerSandboxController {
  /** GET /api/v1/digilocker/sandbox/authorize — render the consent screen. */
  async renderConsent(req: Request, res: Response, next: NextFunction) {
    try {
      const state = String(req.query.state);
      const session = await resolvePendingSession(state);

      const selectedId = (req.query.persona as string) || session.sandboxPersona || SANDBOX_PERSONAS[0].id;

      // Without this the consent form's POST is upgraded to https:// by
      // helmet's global policy and silently fails on a plain-http origin.
      setDigilockerPageCsp(res);

      return res.type("html").send(renderConsentPage({ state, selectedId }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/digilocker/sandbox/authorize — record the decision.
   *
   * On approval this mints a single-use authorization code bound to the
   * session's PKCE challenge, then redirects to the app's redirect_uri. The
   * code is never derived from anything the form supplied — the challenge comes
   * from the stored session — so a tampered form cannot bypass PKCE.
   */
  async submitConsent(req: Request, res: Response, next: NextFunction) {
    try {
      if (!digilockerSandbox) {
        throw new AppError(404, "The DigiLocker sandbox is not available in live mode.");
      }

      const state = String(req.body.state);
      const session = await resolvePendingSession(state);

      const redirectUri = session.redirectUri;
      const separator = redirectUri.includes("?") ? "&" : "?";

      if (req.body.decision === "deny") {
        // Deliberately leaves the session PENDING: real DigiLocker has no
        // back-channel to tell us about a denial either, so the callback is
        // what records the outcome. Keeping it pending means the redirect below
        // is handled by exactly the same code path as in production.
        const params = new URLSearchParams({
          error: "access_denied",
          error_description: "The user denied the DigiLocker consent request",
          state,
        });
        return res.redirect(302, redirectUri + separator + params.toString());
      }

      if (!session.codeChallenge) {
        throw new AppError(400, "This DigiLocker session has no PKCE challenge. Start again.");
      }

      const persona = getPersona(req.body.persona || session.sandboxPersona);
      session.sandboxPersona = persona.id;
      await session.save();

      const code = digilockerSandbox.issueAuthorizationCode(persona.id, session.codeChallenge);

      const params = new URLSearchParams({ code, state });
      return res.redirect(302, redirectUri + separator + params.toString());
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/digilocker/sandbox/personas — the available test identities. */
  async listPersonas(_req: Request, res: Response) {
    return res.json({
      success: true,
      personas: SANDBOX_PERSONAS.map((persona) => ({
        id: persona.id,
        label: persona.label,
        description: persona.description,
        name: persona.name,
        eaadhaarAvailable: persona.eaadhaar,
        maskedAadhaar: persona.maskedAadhaar || null,
        pan: persona.pan || null,
        documents: buildIssuedDocuments(persona).map((doc) => ({
          doctype: doc.doctype,
          name: doc.name,
          uri: doc.uri,
        })),
      })),
    });
  }
}

/** The simulated DigiLocker consent page. */
function renderConsentPage(opts: { state: string; selectedId: string }): string {
  const personaCards = SANDBOX_PERSONAS.map((persona) => {
    const checked = persona.id === opts.selectedId ? " checked" : "";
    const documents = buildIssuedDocuments(persona);

    const chips = documents.length
      ? documents
          .map(
            (doc) =>
              `<span style="display:inline-block;background:#e8f0fe;color:#1967d2;font-size:11px;padding:3px 8px;border-radius:10px;margin:3px 4px 0 0">${escapeHtml(
                doc.name
              )}</span>`
          )
          .join("")
      : `<span style="display:inline-block;background:#fce8e6;color:#c5221f;font-size:11px;padding:3px 8px;border-radius:10px;margin-top:3px">No documents issued</span>`;

    return `<label style="display:block;border:1px solid #dadce0;border-radius:10px;padding:14px;margin-bottom:10px;cursor:pointer">
  <span style="display:flex;align-items:flex-start;gap:10px">
    <input type="radio" name="persona" value="${escapeHtml(persona.id)}"${checked} style="margin-top:3px">
    <span style="flex:1">
      <strong style="display:block;font-size:14px;color:#202124">${escapeHtml(persona.name)}</strong>
      <span style="display:block;font-size:12px;color:#5f6368;margin-top:2px">${escapeHtml(persona.label)} &middot; ${escapeHtml(persona.description)}</span>
      <span style="display:block;margin-top:6px">${chips}</span>
    </span>
  </span>
</label>`;
  }).join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DigiLocker Sandbox Consent</title></head>
<body style="margin:0;min-height:100vh;background:#f6f7f9;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;padding:24px;box-sizing:border-box">
<main style="max-width:480px;margin:0 auto;background:#fff;border-radius:14px;padding:28px;box-shadow:0 2px 16px rgba(0,0,0,.08);box-sizing:border-box">
  <div style="background:#fff4e5;color:#b06000;font-size:12px;padding:8px 12px;border-radius:8px;margin-bottom:20px">
    <strong>Sandbox mode.</strong> This is a simulated DigiLocker consent screen. No real government data is involved.
  </div>

  <h1 style="margin:0 0 6px;font-size:19px;color:#202124">Share documents with Flavour</h1>
  <p style="margin:0 0 20px;color:#5f6368;font-size:14px;line-height:1.5">
    Flavour is requesting access to your issued documents for KYC verification.
    Choose a test identity to continue as.
  </p>

  <form method="POST" action="/api/v1/digilocker/sandbox/authorize">
    <input type="hidden" name="state" value="${escapeHtml(opts.state)}">
    ${personaCards}

    <div style="display:flex;gap:10px;margin-top:22px">
      <button type="submit" name="decision" value="deny"
        style="flex:1;padding:12px;border-radius:8px;border:1px solid #dadce0;background:#fff;color:#5f6368;font-size:14px;font-weight:600;cursor:pointer">Deny</button>
      <button type="submit" name="decision" value="approve"
        style="flex:2;padding:12px;border-radius:8px;border:0;background:#1a73e8;color:#fff;font-size:14px;font-weight:600;cursor:pointer">Allow access</button>
    </div>
  </form>
</main>
</body></html>`;
}

export const digilockerSandboxController = new DigiLockerSandboxController();
