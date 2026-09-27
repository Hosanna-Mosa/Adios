import { digilockerConfig } from "./digilocker.config";
import { DigiLockerApiError } from "./digilocker.errors";
import { parseAadhaarXml, parseDrivingLicenceXml, parsePanXml } from "./digilocker.parsers";
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
  DigiLockerTokenResponse,
  IDigiLockerProvider,
} from "./digilocker.types";

/**
 * Live DigiLocker Partner API (MeriPehchaan) client.
 *
 * Implements OAuth 2.0 authorization-code + PKCE (S256), which DigiLocker
 * mandates for partner applications, plus the issued-documents endpoints.
 *
 * Endpoint versions differ per resource (/public/oauth2/1/token but
 * /public/oauth2/2/files/issued), so URLs are built by swapping the version
 * segment of the configured base rather than concatenating onto it.
 */
export class DigiLockerLiveProvider implements IDigiLockerProvider {
  readonly mode: DigiLockerMode = "live";

  /**
   * Build an endpoint URL at a specific API version, e.g. a base ending in
   * "/public/oauth2/1" with (2, "files/issued") becomes
   * ".../public/oauth2/2/files/issued".
   */
  private endpoint(version: number, path: string): string {
    const base = digilockerConfig.baseUrl.replace(/\/(\d+)$/, "/" + version);
    return base + "/" + path.replace(/^\/+/, "");
  }

  /** fetch() with a timeout, so a hung DigiLocker never pins an Express worker. */
  private async request(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), digilockerConfig.requestTimeoutMs);

    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } catch (error: any) {
      if (error?.name === "AbortError") {
        throw new DigiLockerApiError(
          "DigiLocker did not respond within " + digilockerConfig.requestTimeoutMs + "ms",
          504
        );
      }
      throw new DigiLockerApiError(
        "Could not reach DigiLocker: " + (error?.message || "network error"),
        502
      );
    } finally {
      clearTimeout(timer);
    }
  }

  /** Turn a non-2xx DigiLocker response into a typed error. */
  private async raiseForStatus(response: Response, action: string): Promise<never> {
    const bodyText = await response.text().catch(() => "");
    let code: string | undefined;
    let message: string | undefined;

    try {
      const parsed = JSON.parse(bodyText);
      code = parsed.error || parsed.error_code || parsed.code;
      message = parsed.error_description || parsed.message || parsed.error_message;
    } catch {
      // Non-JSON body (HTML error page / plain text) — keep a short excerpt.
      message = bodyText.slice(0, 200) || undefined;
    }

    // 401/403 means the grant is dead and the user must re-consent; everything
    // else upstream is reported as a bad gateway.
    const statusCode = response.status === 401 || response.status === 403 ? 401 : 502;

    throw new DigiLockerApiError(
      "DigiLocker " + action + " failed: " + (message || response.statusText || "unknown error"),
      statusCode,
      response.status,
      code,
      bodyText.slice(0, 500)
    );
  }

  getAuthorizationUrl(params: AuthorizationUrlParams): string {
    const query = new URLSearchParams({
      response_type: "code",
      client_id: digilockerConfig.clientId,
      redirect_uri: digilockerConfig.redirectUri,
      state: params.state,
      code_challenge: params.codeChallenge,
      code_challenge_method: "S256",
    });

    if (params.dlFlow) query.set("dl_flow", params.dlFlow);
    if (params.acr) query.set("acr", params.acr);
    if (params.verifiedMobile) query.set("verified_mobile", params.verifiedMobile);
    if (params.txn) query.set("txn", params.txn);

    return this.endpoint(1, "authorize") + "?" + query.toString();
  }

  /** Shape DigiLocker's token payload into our normalised bundle. */
  private toBundle(payload: DigiLockerTokenResponse): DigiLockerTokenBundle {
    const expiresInSeconds = Number(payload.expires_in);
    const ttl = Number.isFinite(expiresInSeconds) && expiresInSeconds > 0 ? expiresInSeconds : 3600;

    let consentValidTill: Date | undefined;
    if (payload.consent_valid_till) {
      const raw = Number(payload.consent_valid_till);
      if (Number.isFinite(raw) && raw > 0) {
        // DigiLocker sends Unix seconds; tolerate millisecond values too.
        consentValidTill = new Date(raw > 1e12 ? raw : raw * 1000);
      } else {
        const parsed = new Date(String(payload.consent_valid_till));
        if (!Number.isNaN(parsed.getTime())) consentValidTill = parsed;
      }
    }

    return {
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      tokenType: payload.token_type || "Bearer",
      expiresAt: new Date(Date.now() + ttl * 1000),
      scope: (payload.scope || "").split(/[\s,]+/).filter(Boolean),
      consentValidTill,
      digilockerId: payload.digilockerid,
      name: payload.name,
      dob: payload.dob,
      gender: payload.gender,
      eaadhaarAvailable: String(payload.eaadhaar || "").toUpperCase() === "Y",
      referenceKey: payload.reference_key,
      newAccount: String(payload.new_account || "").toUpperCase() === "Y",
      raw: payload,
    };
  }

  /** POST to /token — shared by the code exchange and the refresh flow. */
  private async postToken(
    body: Record<string, string>,
    action: string
  ): Promise<DigiLockerTokenBundle> {
    const response = await this.request(this.endpoint(1, "token"), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams(body).toString(),
    });

    if (!response.ok) await this.raiseForStatus(response, action);

    const payload = (await response.json().catch(() => null)) as DigiLockerTokenResponse | null;
    if (!payload?.access_token) {
      throw new DigiLockerApiError("DigiLocker " + action + " returned no access token", 502);
    }

    return this.toBundle(payload);
  }

  async exchangeCodeForToken(code: string, codeVerifier: string): Promise<DigiLockerTokenBundle> {
    return this.postToken(
      {
        code,
        grant_type: "authorization_code",
        client_id: digilockerConfig.clientId,
        client_secret: digilockerConfig.clientSecret,
        redirect_uri: digilockerConfig.redirectUri,
        code_verifier: codeVerifier,
      },
      "token exchange"
    );
  }

  async refreshAccessToken(refreshToken: string): Promise<DigiLockerTokenBundle> {
    return this.postToken(
      {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: digilockerConfig.clientId,
        client_secret: digilockerConfig.clientSecret,
      },
      "token refresh"
    );
  }

  async listIssuedDocuments(accessToken: string): Promise<DigiLockerIssuedDocument[]> {
    const response = await this.request(this.endpoint(2, "files/issued"), {
      method: "GET",
      headers: { Authorization: "Bearer " + accessToken, Accept: "application/json" },
    });

    if (!response.ok) await this.raiseForStatus(response, "issued documents fetch");

    const payload = (await response.json().catch(() => null)) as any;
    const items: any[] = Array.isArray(payload) ? payload : payload?.items || [];

    return items
      .filter((item) => item?.uri)
      .map((item) => ({
        name: item.name || item.description || item.doctype || "Document",
        uri: item.uri,
        doctype: item.doctype || "",
        description: item.description,
        issuer: item.issuer,
        issuerId: item.issuerid || item.issuerId,
        mime: Array.isArray(item.mime) ? item.mime : item.mime ? [item.mime] : [],
        size: item.size !== undefined ? String(item.size) : undefined,
        date: item.date,
      }));
  }

  async getDocument(
    accessToken: string,
    uri: string,
    format: "pdf" | "xml" = "pdf"
  ): Promise<DigiLockerDocumentContent> {
    // /file/{uri} returns the rendered PDF; /xml/{uri} returns structured data.
    const path =
      format === "xml" ? "xml/" + encodeURIComponent(uri) : "file/" + encodeURIComponent(uri);

    const response = await this.request(this.endpoint(1, path), {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
        Accept: format === "xml" ? "application/xml" : "application/pdf",
      },
    });

    if (!response.ok) await this.raiseForStatus(response, "document fetch (" + uri + ")");

    const buffer = Buffer.from(await response.arrayBuffer());
    const mime =
      response.headers.get("content-type")?.split(";")[0].trim() ||
      (format === "xml" ? "application/xml" : "application/pdf");

    return {
      uri,
      mime,
      content: buffer,
      fileName: uri.replace(/[^\w.-]/g, "_") + "." + format,
    };
  }

  async getAadhaar(accessToken: string): Promise<DigiLockerAadhaarData> {
    // The dedicated eAadhaar endpoint works whenever the token payload reported
    // eaadhaar="Y"; otherwise fall back to the issued-documents listing.
    const response = await this.request(this.endpoint(1, "xml/eaadhaar"), {
      method: "GET",
      headers: { Authorization: "Bearer " + accessToken, Accept: "application/xml" },
    });

    if (response.ok) {
      return parseAadhaarXml(await response.text());
    }

    if (response.status === 401 || response.status === 403) {
      await this.raiseForStatus(response, "Aadhaar fetch");
    }

    const document = await this.findIssuedDocument(accessToken, DigiLockerDocType.AADHAAR, "Aadhaar");
    const content = await this.getDocument(accessToken, document.uri, "xml");
    return parseAadhaarXml(content.content.toString("utf8"));
  }

  async getPan(accessToken: string): Promise<DigiLockerPanData> {
    const document = await this.findIssuedDocument(accessToken, DigiLockerDocType.PAN, "PAN");
    const content = await this.getDocument(accessToken, document.uri, "xml");
    return parsePanXml(content.content.toString("utf8"));
  }

  async getDrivingLicence(accessToken: string): Promise<DigiLockerDrivingLicenceData> {
    const document = await this.findIssuedDocument(
      accessToken,
      DigiLockerDocType.DRIVING_LICENCE,
      "driving licence"
    );
    const content = await this.getDocument(accessToken, document.uri, "xml");
    return parseDrivingLicenceXml(content.content.toString("utf8"));
  }

  /** Locate an issued document by doctype, erroring clearly when the user has none. */
  private async findIssuedDocument(
    accessToken: string,
    doctype: string,
    label: string
  ): Promise<DigiLockerIssuedDocument> {
    const documents = await this.listIssuedDocuments(accessToken);
    const match = documents.find((doc) => doc.doctype?.toUpperCase() === doctype);

    if (!match) {
      throw new DigiLockerApiError(
        "No " + label + " document is issued to this DigiLocker account. " +
          "Please add it in the DigiLocker app and try again.",
        404,
        404,
        "document_not_issued"
      );
    }

    return match;
  }

  async revokeToken(accessToken: string): Promise<void> {
    try {
      const response = await this.request(this.endpoint(1, "revoke"), {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          token: accessToken,
          client_id: digilockerConfig.clientId,
          client_secret: digilockerConfig.clientSecret,
        }).toString(),
      });

      if (!response.ok) {
        // Revocation is best-effort: we always drop our local copy regardless.
        console.warn("[DIGILOCKER] Token revocation returned HTTP " + response.status);
      }
    } catch (error: any) {
      console.warn("[DIGILOCKER] Token revocation failed:", error?.message || error);
    }
  }
}
