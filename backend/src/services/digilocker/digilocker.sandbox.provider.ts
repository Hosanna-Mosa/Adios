import { decryptSecret, deriveCodeChallenge, encryptSecret, randomToken, safeEqual } from "../../utils/crypto";
import { digilockerConfig } from "./digilocker.config";
import { DigiLockerApiError } from "./digilocker.errors";
import { parseAadhaarXml, parseDrivingLicenceXml, parsePanXml } from "./digilocker.parsers";
import {
  buildDocumentXml,
  buildIssuedDocuments,
  getPersona,
  SandboxPersona,
  SANDBOX_PERSONAS,
} from "./digilocker.personas";
import {
  AuthorizationUrlParams,
  DigiLockerAadhaarData,
  DigiLockerDocType,
  DigiLockerDocumentContent,
  DigiLockerDrivingLicenceData,
  DigiLockerIssuedDocument,
  DigiLockerMode,
  DigiLockerPanData,
  DigiLockerTokenBundle,
  IDigiLockerProvider,
} from "./digilocker.types";

/**
 * In-process DigiLocker simulator.
 *
 * This is a real OAuth authorization server in miniature, not a stub that
 * returns canned objects: it issues single-use authorization codes, verifies
 * the PKCE S256 challenge, enforces code and token expiry, honours refresh
 * tokens, and serves documents as DigiLocker-shaped XML that goes through the
 * same parsers the live provider uses. That means the only thing untested when
 * you switch DIGILOCKER_MODE to live is the network hop itself.
 *
 * Codes and tokens are self-contained AES-GCM encrypted payloads, so the flow
 * survives a nodemon restart mid-consent without needing its own collection.
 */

interface SandboxCodePayload {
  t: "code";
  persona: string;
  challenge: string;
  exp: number;
  nonce: string;
}

interface SandboxTokenPayload {
  t: "access" | "refresh";
  persona: string;
  digilockerId: string;
  exp: number;
  scope: string;
}

/** Access-token lifetime, mirroring DigiLocker's one hour. */
const ACCESS_TOKEN_TTL_SECONDS = 3600;
/** Refresh-token lifetime. */
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 3600;
/** Consent validity DigiLocker grants a partner. */
const CONSENT_TTL_SECONDS = 30 * 24 * 3600;
const SANDBOX_SCOPE = "files.issueddocs avs_parent";

/**
 * Codes already redeemed, held until they would have expired anyway.
 * Belt-and-braces against replay inside the code's TTL — the session layer
 * also refuses to re-consume a session that has already been linked.
 */
const consumedCodes = new Map<string, number>();

function rememberConsumed(nonce: string, expiresAtMs: number): void {
  consumedCodes.set(nonce, expiresAtMs);

  // Opportunistic sweep; the map only ever holds a few minutes of codes.
  if (consumedCodes.size > 500) {
    const now = Date.now();
    for (const [key, expiry] of consumedCodes) {
      if (expiry <= now) consumedCodes.delete(key);
    }
  }
}

export class DigiLockerSandboxProvider implements IDigiLockerProvider {
  readonly mode: DigiLockerMode = "sandbox";

  /** The personas a caller can choose between on the sandbox consent screen. */
  get personas(): SandboxPersona[] {
    return SANDBOX_PERSONAS;
  }

  getAuthorizationUrl(params: AuthorizationUrlParams): string {
    // Prefer the origin the client actually reached us on. A phone on a LAN
    // cannot open "localhost", and a hardcoded PUBLIC_BASE_URL goes stale the
    // moment the machine changes network — this is always reachable because
    // the client just used it.
    const origin = params.requestOrigin || digilockerConfig.publicBaseUrl;

    const query = new URLSearchParams({
      response_type: "code",
      client_id: digilockerConfig.clientId,
      redirect_uri: origin + "/api/v1/digilocker/callback",
      state: params.state,
      code_challenge: params.codeChallenge,
      code_challenge_method: "S256",
    });

    if (params.persona) query.set("persona", params.persona);
    if (params.dlFlow) query.set("dl_flow", params.dlFlow);
    if (params.acr) query.set("acr", params.acr);
    if (params.txn) query.set("txn", params.txn);

    // Points at this backend's own consent screen, so the URL is genuinely
    // openable in a browser or the driver app's WebView.
    return origin + "/api/v1/digilocker/sandbox/authorize?" + query.toString();
  }

  /**
   * Mint a single-use authorization code bound to a persona and a PKCE
   * challenge. Called by the sandbox consent screen when the user approves.
   */
  issueAuthorizationCode(personaId: string, codeChallenge: string): string {
    const payload: SandboxCodePayload = {
      t: "code",
      persona: getPersona(personaId).id,
      challenge: codeChallenge,
      exp: Date.now() + digilockerConfig.authCodeTtlSeconds * 1000,
      nonce: randomToken(12),
    };

    const encoded = encryptSecret(JSON.stringify(payload));
    if (!encoded) throw new DigiLockerApiError("Sandbox could not issue an authorization code", 500);
    return encoded;
  }

  /** Decode + validate one of our encrypted payloads. */
  private decode<T extends { t: string; exp: number }>(raw: string, expected: T["t"]): T {
    const decoded = decryptSecret(raw);
    if (!decoded) {
      throw new DigiLockerApiError("Invalid DigiLocker credential", 400, 400, "invalid_grant");
    }

    let payload: T;
    try {
      payload = JSON.parse(decoded) as T;
    } catch {
      throw new DigiLockerApiError("Malformed DigiLocker credential", 400, 400, "invalid_grant");
    }

    if (payload.t !== expected) {
      throw new DigiLockerApiError(
        "Expected a DigiLocker " + expected + " credential",
        400,
        400,
        "invalid_grant"
      );
    }

    if (!payload.exp || payload.exp <= Date.now()) {
      throw new DigiLockerApiError(
        "DigiLocker " + expected + " has expired",
        401,
        401,
        expected === "code" ? "invalid_grant" : "expired_token"
      );
    }

    return payload;
  }

  /** Build the token bundle a successful sandbox grant produces. */
  private issueTokens(persona: SandboxPersona): DigiLockerTokenBundle {
    const now = Date.now();

    const accessToken = encryptSecret(
      JSON.stringify({
        t: "access",
        persona: persona.id,
        digilockerId: persona.digilockerId,
        exp: now + ACCESS_TOKEN_TTL_SECONDS * 1000,
        scope: SANDBOX_SCOPE,
      } satisfies SandboxTokenPayload)
    )!;

    const refreshToken = encryptSecret(
      JSON.stringify({
        t: "refresh",
        persona: persona.id,
        digilockerId: persona.digilockerId,
        exp: now + REFRESH_TOKEN_TTL_SECONDS * 1000,
        scope: SANDBOX_SCOPE,
      } satisfies SandboxTokenPayload)
    )!;

    return {
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresAt: new Date(now + ACCESS_TOKEN_TTL_SECONDS * 1000),
      scope: SANDBOX_SCOPE.split(" "),
      consentValidTill: new Date(now + CONSENT_TTL_SECONDS * 1000),
      digilockerId: persona.digilockerId,
      name: persona.name,
      dob: persona.dob,
      gender: persona.gender,
      eaadhaarAvailable: persona.eaadhaar,
      referenceKey: randomToken(16),
      newAccount: false,
      raw: {
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: ACCESS_TOKEN_TTL_SECONDS,
        refresh_token: refreshToken,
        scope: SANDBOX_SCOPE,
        consent_valid_till: Math.floor((now + CONSENT_TTL_SECONDS * 1000) / 1000),
        digilockerid: persona.digilockerId,
        name: persona.name,
        dob: persona.dob,
        gender: persona.gender,
        eaadhaar: persona.eaadhaar ? "Y" : "N",
        sandbox: true,
      },
    };
  }

  async exchangeCodeForToken(code: string, codeVerifier: string): Promise<DigiLockerTokenBundle> {
    const payload = this.decode<SandboxCodePayload>(code, "code");

    if (consumedCodes.has(payload.nonce)) {
      throw new DigiLockerApiError(
        "This DigiLocker authorization code has already been used",
        400,
        400,
        "invalid_grant"
      );
    }

    // Real PKCE verification — a wrong or missing verifier fails here exactly
    // as it would against the live authorization server.
    if (!safeEqual(deriveCodeChallenge(codeVerifier), payload.challenge)) {
      throw new DigiLockerApiError(
        "PKCE verification failed for this DigiLocker authorization code",
        400,
        400,
        "invalid_grant"
      );
    }

    rememberConsumed(payload.nonce, payload.exp);

    return this.issueTokens(getPersona(payload.persona));
  }

  async refreshAccessToken(refreshToken: string): Promise<DigiLockerTokenBundle> {
    const payload = this.decode<SandboxTokenPayload>(refreshToken, "refresh");
    return this.issueTokens(getPersona(payload.persona));
  }

  /** Resolve the persona behind an access token, enforcing expiry. */
  private personaFromAccessToken(accessToken: string): SandboxPersona {
    const payload = this.decode<SandboxTokenPayload>(accessToken, "access");
    return getPersona(payload.persona);
  }

  async listIssuedDocuments(accessToken: string): Promise<DigiLockerIssuedDocument[]> {
    return buildIssuedDocuments(this.personaFromAccessToken(accessToken));
  }

  async getDocument(
    accessToken: string,
    uri: string,
    format: "pdf" | "xml" = "pdf"
  ): Promise<DigiLockerDocumentContent> {
    const persona = this.personaFromAccessToken(accessToken);
    const xml = buildDocumentXml(persona, uri);

    if (!xml) {
      throw new DigiLockerApiError(
        "No document with URI " + uri + " is issued to this DigiLocker account",
        404,
        404,
        "document_not_issued"
      );
    }

    if (format === "xml") {
      return {
        uri,
        mime: "application/xml",
        content: Buffer.from(xml, "utf8"),
        fileName: uri.replace(/[^\w.-]/g, "_") + ".xml",
      };
    }

    // The sandbox has no rendering pipeline, so it returns a small valid PDF
    // carrying the document title — enough for clients to prove the download
    // path works end to end.
    return {
      uri,
      mime: "application/pdf",
      content: buildPlaceholderPdf(uri, persona.name),
      fileName: uri.replace(/[^\w.-]/g, "_") + ".pdf",
    };
  }

  async getAadhaar(accessToken: string): Promise<DigiLockerAadhaarData> {
    const persona = this.personaFromAccessToken(accessToken);

    if (!persona.eaadhaar) {
      throw new DigiLockerApiError(
        "No Aadhaar document is issued to this DigiLocker account. " +
          "Please add it in the DigiLocker app and try again.",
        404,
        404,
        "document_not_issued"
      );
    }

    const document = buildIssuedDocuments(persona).find(
      (doc) => doc.doctype === DigiLockerDocType.AADHAAR
    )!;

    // Round-trip through the shared parser so sandbox and live return
    // identically-shaped data.
    return parseAadhaarXml(buildDocumentXml(persona, document.uri)!);
  }

  async getPan(accessToken: string): Promise<DigiLockerPanData> {
    const persona = this.personaFromAccessToken(accessToken);

    if (!persona.pan) {
      throw new DigiLockerApiError(
        "No PAN document is issued to this DigiLocker account. " +
          "Please add it in the DigiLocker app and try again.",
        404,
        404,
        "document_not_issued"
      );
    }

    const document = buildIssuedDocuments(persona).find(
      (doc) => doc.doctype === DigiLockerDocType.PAN
    )!;

    return parsePanXml(buildDocumentXml(persona, document.uri)!);
  }

  async getDrivingLicence(accessToken: string): Promise<DigiLockerDrivingLicenceData> {
    const persona = this.personaFromAccessToken(accessToken);

    if (!persona.drivingLicence) {
      throw new DigiLockerApiError(
        "No driving licence is issued to this DigiLocker account. " +
          "Please add it in the DigiLocker app and try again.",
        404,
        404,
        "document_not_issued"
      );
    }

    const document = buildIssuedDocuments(persona).find(
      (doc) => doc.doctype === DigiLockerDocType.DRIVING_LICENCE
    )!;

    return parseDrivingLicenceXml(buildDocumentXml(persona, document.uri)!);
  }

  async revokeToken(_accessToken: string): Promise<void> {
    // Sandbox tokens are stateless and self-expiring; dropping our stored copy
    // in the session layer is the whole of revocation here.
  }
}

/**
 * Build a minimal, structurally valid single-page PDF.
 * Hand-assembled (with a correct xref table) so the sandbox does not need a
 * PDF dependency just to return a downloadable file.
 */
function buildPlaceholderPdf(uri: string, holder: string): Buffer {
  const escape = (value: string) => value.replace(/([\\()])/g, "\\$1");
  const lines = [
    "DigiLocker Sandbox Document",
    "Issued to: " + escape(holder),
    "URI: " + escape(uri),
    "This is simulated data. Not a valid document.",
  ];

  const stream =
    "BT\n/F1 14 Tf\n72 760 Td\n18 TL\n" +
    lines.map((line) => "(" + line + ") Tj T*").join("\n") +
    "\nET";

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    "<< /Length " + Buffer.byteLength(stream, "utf8") + " >>\nstream\n" + stream + "\nendstream",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += index + 1 + " 0 obj\n" + body + "\nendobj\n";
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += String(offset).padStart(10, "0") + " 00000 n \n";
  }
  pdf +=
    "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xrefOffset + "\n%%EOF";

  return Buffer.from(pdf, "utf8");
}
