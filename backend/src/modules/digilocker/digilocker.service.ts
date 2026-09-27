import Driver, { IDriver, OnboardingStatus } from "../../database/models/Driver";
import DigiLockerSession, {
  DigiLockerPurpose,
  DigiLockerSessionStatus,
  IDigiLockerSession,
} from "../../database/models/DigiLockerSession";
import { createPkcePair, randomToken } from "../../utils/crypto";
import { NotFoundError } from "../../utils/errors";
import {
  digilockerConfig,
  digilockerProvider,
  DigiLockerApiError,
  DigiLockerAadhaarData,
  DigiLockerDrivingLicenceData,
  DigiLockerPanData,
  DigiLockerSessionError,
  isValidPanFormat,
  toDate,
} from "../../services/digilocker";

/**
 * DigiLocker module service.
 *
 * Owns the consent lifecycle and everything we persist from it. The provider
 * layer below handles the DigiLocker protocol; this layer decides what a
 * session means for our users and drivers.
 */

export interface StartSessionOptions {
  purpose?: DigiLockerPurpose;
  /** Sandbox-only: which test persona the consent screen preselects. */
  persona?: string;
  /** Pre-fills the mobile number on DigiLocker's sign-in screen. */
  verifiedMobile?: string;
  /** Deep link the callback bounces the mobile client back to. */
  clientRedirectUrl?: string;
  /** Origin the client reached us on; sandbox uses it to stay reachable. */
  requestOrigin?: string;
}

/**
 * Decide whether a client-supplied return URL is safe to bounce to.
 *
 * The callback page redirects the browser to this value, so accepting anything
 * would turn our callback into an open redirect — a phishing primitive. Only
 * app schemes are allowed (flavour-driver://, exp://, exp+foo://), plus the
 * server's own configured value. http(s) is refused outright.
 */
function isSafeClientRedirect(candidate: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return false;
  }

  const scheme = parsed.protocol.replace(":", "").toLowerCase();

  // The configured default is trusted whatever its scheme.
  if (digilockerConfig.clientRedirectUrl && candidate === digilockerConfig.clientRedirectUrl) {
    return true;
  }

  // Anything that lands in a browser is refused.
  if (scheme === "http" || scheme === "https" || scheme === "javascript" || scheme === "data") {
    return false;
  }

  // Custom app schemes only: our own, or an Expo dev-client scheme.
  return scheme === "flavour-driver" || scheme === "exp" || scheme.startsWith("exp+");
}

export class DigiLockerModuleService {
  /**
   * Begin a consent flow: mint PKCE material, persist a PENDING session, and
   * return the URL the client opens.
   *
   * Any earlier PENDING sessions for this user are abandoned first, so a user
   * who taps "Verify" twice cannot end up with two live states racing to link.
   */
  async startSession(userId: string, options: StartSessionOptions = {}) {
    await DigiLockerSession.updateMany(
      { user: userId, status: DigiLockerSessionStatus.PENDING },
      {
        $set: {
          status: DigiLockerSessionStatus.EXPIRED,
          lastError: "Superseded by a newer DigiLocker verification attempt",
        },
      }
    );

    const state = randomToken(32);
    const { codeVerifier, codeChallenge } = createPkcePair();

    const authUrl = digilockerProvider.getAuthorizationUrl({
      state,
      codeChallenge,
      persona: options.persona,
      verifiedMobile: options.verifiedMobile,
      requestOrigin: options.requestOrigin,
    });

    // The callback has to be on the same origin as the consent screen, or the
    // redirect lands somewhere the device cannot reach.
    const redirectUri =
      digilockerConfig.isSandbox && options.requestOrigin
        ? options.requestOrigin + "/api/v1/digilocker/callback"
        : digilockerConfig.redirectUri;

    const expiresAt = new Date(Date.now() + digilockerConfig.sessionTtlMinutes * 60 * 1000);

    // An unusable or unsafe value is dropped rather than rejected: consent is
    // still perfectly completable, the browser just won't auto-close.
    let clientRedirectUrl: string | undefined;
    if (options.clientRedirectUrl) {
      if (isSafeClientRedirect(options.clientRedirectUrl)) {
        clientRedirectUrl = options.clientRedirectUrl;
      } else {
        console.warn(
          `[DIGILOCKER] Ignoring unsafe clientRedirectUrl from user ${userId}: ${options.clientRedirectUrl}`
        );
      }
    }

    const session = new DigiLockerSession({
      user: userId,
      status: DigiLockerSessionStatus.PENDING,
      purpose: options.purpose || DigiLockerPurpose.KYC,
      mode: digilockerConfig.mode,
      state,
      codeChallenge,
      redirectUri,
      authUrl,
      clientRedirectUrl,
      sandboxPersona: digilockerConfig.isSandbox ? options.persona : undefined,
      expiresAt,
    });

    session.setCodeVerifier(codeVerifier);
    await session.save();

    return {
      sessionId: session.id as string,
      state,
      authUrl,
      mode: digilockerConfig.mode,
      expiresAt,
      /** Sandbox consent is simulated — clients should label it as test data. */
      sandbox: digilockerConfig.isSandbox,
    };
  }

  /**
   * Finish a consent flow: exchange the one-time code for tokens and promote
   * the session to LINKED.
   *
   * The session is resolved by the `verifyDigilockerState` middleware, which
   * has already proved it is PENDING, unexpired and (when the caller is
   * authenticated) owned by them.
   */
  async completeConsent(session: IDigiLockerSession, code: string) {
    const codeVerifier = session.getCodeVerifier();

    if (!codeVerifier) {
      session.status = DigiLockerSessionStatus.FAILED;
      session.lastError = "PKCE verifier missing or undecryptable";
      await session.save();
      throw new DigiLockerSessionError(
        "This DigiLocker verification could not be completed. Please start again.",
        400,
        "pkce_verifier_missing"
      );
    }

    let bundle;
    try {
      bundle = await digilockerProvider.exchangeCodeForToken(code, codeVerifier);
    } catch (error: any) {
      session.status = DigiLockerSessionStatus.FAILED;
      session.lastError = error?.message || "Authorization code exchange failed";
      session.setCodeVerifier(null);
      await session.save();
      throw error;
    }

    // Only one live grant per user: retire any previous link.
    await DigiLockerSession.updateMany(
      {
        user: session.user,
        status: DigiLockerSessionStatus.LINKED,
        _id: { $ne: session._id },
      },
      {
        $set: {
          status: DigiLockerSessionStatus.REVOKED,
          revokedAt: new Date(),
          lastError: "Replaced by a newer DigiLocker link",
          accessTokenEnc: null,
          refreshTokenEnc: null,
        },
      }
    );

    session.status = DigiLockerSessionStatus.LINKED;
    session.linkedAt = new Date();
    session.setAccessToken(bundle.accessToken);
    session.setRefreshToken(bundle.refreshToken);
    session.setCodeVerifier(null); // single-use — no reason to keep it
    session.accessTokenExpiresAt = bundle.expiresAt;
    session.tokenType = bundle.tokenType;
    session.scope = bundle.scope;
    session.consentValidTill = bundle.consentValidTill;
    session.digilockerId = bundle.digilockerId;
    session.holderName = bundle.name;
    session.holderDob = bundle.dob;
    session.holderGender = bundle.gender;
    session.eaadhaarAvailable = bundle.eaadhaarAvailable;
    session.lastError = undefined;
    // Clearing this exempts the row from the pending-session TTL sweep.
    session.expiresAt = null;

    await session.save();

    return {
      sessionId: session.id as string,
      status: session.status,
      mode: session.mode,
      linkedAt: session.linkedAt,
      consentValidTill: session.consentValidTill,
      account: {
        digilockerId: bundle.digilockerId,
        name: bundle.name,
        dob: bundle.dob,
        gender: bundle.gender,
        eaadhaarAvailable: bundle.eaadhaarAvailable,
      },
      sandbox: digilockerConfig.isSandbox,
    };
  }

  /** Current DigiLocker link status for a user — safe to call unauthenticated-of-grant. */
  async getStatus(userId: string) {
    const session = await DigiLockerSession.findOne({
      user: userId,
      status: DigiLockerSessionStatus.LINKED,
    }).sort({ linkedAt: -1, createdAt: -1 });

    if (!session) {
      const lastAttempt = await DigiLockerSession.findOne({ user: userId }).sort({ createdAt: -1 });

      return {
        linked: false,
        mode: digilockerConfig.mode,
        sandbox: digilockerConfig.isSandbox,
        status: lastAttempt?.status || null,
        lastAttemptAt: lastAttempt?.createdAt || null,
        lastError: lastAttempt?.lastError || null,
      };
    }

    return {
      linked: true,
      mode: session.mode,
      sandbox: session.mode === "sandbox",
      status: session.status,
      sessionId: session.id as string,
      linkedAt: session.linkedAt,
      consentValidTill: session.consentValidTill,
      accessTokenExpiresAt: session.accessTokenExpiresAt,
      scope: session.scope,
      account: {
        digilockerId: session.digilockerId,
        name: session.holderName,
        dob: session.holderDob,
        gender: session.holderGender,
        eaadhaarAvailable: session.eaadhaarAvailable,
      },
      documents: session.documents,
      documentsFetchedAt: session.documentsFetchedAt,
      aadhaarFetchedAt: session.aadhaarFetchedAt,
      panFetchedAt: session.panFetchedAt,
      syncedToDriverAt: session.syncedToDriverAt,
    };
  }

  /** List the documents DigiLocker has issued to the linked account. */
  async listDocuments(session: IDigiLockerSession, accessToken: string) {
    const documents = await digilockerProvider.listIssuedDocuments(accessToken);

    session.documents = documents.map((doc) => ({
      uri: doc.uri,
      doctype: doc.doctype,
      name: doc.name,
      issuer: doc.issuer,
      issuerId: doc.issuerId,
      mime: doc.mime,
      size: doc.size,
      date: doc.date,
    }));
    session.documentsFetchedAt = new Date();
    await session.save();

    return { documents, fetchedAt: session.documentsFetchedAt, mode: session.mode };
  }

  /** Download a single issued document as PDF bytes or XML. */
  async getDocument(
    session: IDigiLockerSession,
    accessToken: string,
    uri: string,
    format: "pdf" | "xml"
  ) {
    return digilockerProvider.getDocument(accessToken, uri, format);
  }

  /** Fetch + cache the linked account's Aadhaar KYC. */
  async getAadhaar(session: IDigiLockerSession, accessToken: string) {
    const data = await digilockerProvider.getAadhaar(accessToken);

    session.aadhaarData = data as Record<string, any>;
    session.aadhaarFetchedAt = new Date();
    await session.save();

    return { data, fetchedAt: session.aadhaarFetchedAt, mode: session.mode };
  }

  /** Fetch + cache the linked account's PAN details. */
  async getPan(session: IDigiLockerSession, accessToken: string) {
    const data = await digilockerProvider.getPan(accessToken);

    if (data.panNumber && !isValidPanFormat(data.panNumber)) {
      throw new DigiLockerApiError(
        "DigiLocker returned a PAN in an unexpected format. Please try again.",
        502,
        undefined,
        "invalid_pan_format"
      );
    }

    session.panData = data as Record<string, any>;
    session.panFetchedAt = new Date();
    await session.save();

    return { data, fetchedAt: session.panFetchedAt, mode: session.mode };
  }

  /** Fetch + cache the linked account's driving licence. */
  async getDrivingLicence(session: IDigiLockerSession, accessToken: string) {
    const data = await digilockerProvider.getDrivingLicence(accessToken);

    session.drivingLicenceData = data as Record<string, any>;
    session.drivingLicenceFetchedAt = new Date();
    await session.save();

    return { data, fetchedAt: session.drivingLicenceFetchedAt, mode: session.mode };
  }

  /** Force an access-token refresh, independent of the automatic one. */
  async refresh(session: IDigiLockerSession) {
    const refreshToken = session.getRefreshToken();

    if (!refreshToken) {
      throw new DigiLockerSessionError(
        "No DigiLocker refresh token is stored. Please authorise access again.",
        428,
        "refresh_token_missing"
      );
    }

    const bundle = await digilockerProvider.refreshAccessToken(refreshToken);

    session.setAccessToken(bundle.accessToken);
    if (bundle.refreshToken) session.setRefreshToken(bundle.refreshToken);
    session.accessTokenExpiresAt = bundle.expiresAt;
    session.tokenType = bundle.tokenType;
    if (bundle.scope.length) session.scope = bundle.scope;
    if (bundle.consentValidTill) session.consentValidTill = bundle.consentValidTill;
    session.lastError = undefined;
    await session.save();

    return {
      accessTokenExpiresAt: session.accessTokenExpiresAt,
      consentValidTill: session.consentValidTill,
      scope: session.scope,
    };
  }

  /** Revoke at DigiLocker (best-effort) and drop our stored credentials. */
  async revoke(session: IDigiLockerSession) {
    const accessToken = session.getAccessToken();

    if (accessToken) {
      await digilockerProvider.revokeToken(accessToken);
    }

    session.status = DigiLockerSessionStatus.REVOKED;
    session.revokedAt = new Date();
    session.setAccessToken(null);
    session.setRefreshToken(null);
    session.setCodeVerifier(null);
    await session.save();

    return { revoked: true, revokedAt: session.revokedAt };
  }

  /**
   * Copy DigiLocker-verified identity onto the caller's Driver record.
   *
   * This is the payoff of the whole flow: a driver who consented through
   * DigiLocker gets `aadhaarVerified` set from a government source rather than
   * from a self-declared number. Only the masked Aadhaar is ever stored.
   */
  async syncToDriver(userId: string, session: IDigiLockerSession, accessToken: string) {
    const driver = await this.getOrCreateDriver(userId);

    let aadhaar: DigiLockerAadhaarData | null = null;
    let pan: DigiLockerPanData | null = null;
    let licence: DigiLockerDrivingLicenceData | null = null;
    const skipped: string[] = [];

    // Each document is optional: a driver may have Aadhaar but no PAN issued,
    // and that should still be a partial success rather than a hard failure.
    try {
      aadhaar = (await this.getAadhaar(session, accessToken)).data;
    } catch (error: any) {
      if (error instanceof DigiLockerApiError && error.upstreamCode === "document_not_issued") {
        skipped.push("aadhaar");
      } else {
        throw error;
      }
    }

    try {
      pan = (await this.getPan(session, accessToken)).data;
    } catch (error: any) {
      if (error instanceof DigiLockerApiError && error.upstreamCode === "document_not_issued") {
        skipped.push("pan");
      } else {
        throw error;
      }
    }

    try {
      licence = (await this.getDrivingLicence(session, accessToken)).data;
    } catch (error: any) {
      if (error instanceof DigiLockerApiError && error.upstreamCode === "document_not_issued") {
        skipped.push("drivingLicence");
      } else {
        throw error;
      }
    }

    const updated: string[] = [];

    if (aadhaar?.maskedAadhaarNumber) {
      driver.aadhaarNumber = aadhaar.maskedAadhaarNumber;
      driver.aadhaarVerified = true;
      updated.push("aadhaarNumber", "aadhaarVerified");
    }

    if (pan?.panNumber && isValidPanFormat(pan.panNumber)) {
      driver.panNumber = pan.panNumber;
      driver.panVerified = true;
      updated.push("panNumber", "panVerified");
    }

    if (licence?.licenceNumber) {
      driver.dlNumber = licence.licenceNumber;
      driver.dlVerified = true;
      updated.push("dlNumber", "dlVerified");

      const expiry = toDate(licence.validTill);
      if (expiry) {
        driver.dlExpiry = expiry;
        updated.push("dlExpiry");
      }
      if (licence.vehicleClass) {
        driver.dlVehicleClass = licence.vehicleClass;
        updated.push("dlVehicleClass");
      }
    }

    const gender = (aadhaar?.gender || session.holderGender || "").toUpperCase();
    if (!driver.gender && (gender === "M" || gender === "F")) {
      driver.gender = gender === "M" ? "male" : "female";
      updated.push("gender");
    }

    if (updated.length) {
      driver.kycSource = "digilocker";
      driver.digilockerVerified = true;
      driver.digilockerVerifiedAt = new Date();
      driver.digilockerId = session.digilockerId;
      updated.push("kycSource", "digilockerVerified");

      if (driver.onboardingStatus === OnboardingStatus.NOT_STARTED) {
        driver.onboardingStatus = OnboardingStatus.IN_PROGRESS;
      }
      await driver.save();
    }

    session.syncedToDriverAt = new Date();
    await session.save();

    return {
      synced: updated.length > 0,
      updatedFields: [...new Set(updated)],
      skipped,
      driver: {
        aadhaarNumber: driver.aadhaarNumber,
        aadhaarVerified: driver.aadhaarVerified,
        panNumber: driver.panNumber,
        panVerified: driver.panVerified,
        dlNumber: driver.dlNumber,
        dlVerified: driver.dlVerified,
        dlExpiry: driver.dlExpiry,
        dlVehicleClass: driver.dlVehicleClass,
        gender: driver.gender,
        onboardingStatus: driver.onboardingStatus,
        digilockerVerifiedAt: driver.digilockerVerifiedAt,
      },
      sandbox: session.mode === "sandbox",
    };
  }

  /** Full attempt history for a user — used by the admin/support view. */
  async listSessions(userId: string, limit = 20) {
    const sessions = await DigiLockerSession.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 100))
      .select("-accessTokenEnc -refreshTokenEnc -codeVerifierEnc");

    return { sessions, count: sessions.length };
  }

  /**
   * Mirrors OnboardingService.getOrCreateDriver — a Driver row is created on
   * first KYC touch, not at signup.
   */
  private async getOrCreateDriver(userId: string): Promise<IDriver> {
    let driver = await Driver.findOne({ user: userId });

    if (!driver) {
      driver = new Driver({ user: userId, onboardingStatus: OnboardingStatus.IN_PROGRESS });
      await driver.save();
    }

    return driver;
  }

  /** Look up a linked session by id, scoped to its owner. */
  async findLinkedSession(userId: string, sessionId: string): Promise<IDigiLockerSession> {
    const session = await DigiLockerSession.findOne({ _id: sessionId, user: userId });
    if (!session) throw new NotFoundError("DigiLocker session not found");
    return session;
  }
}

export const digilockerModuleService = new DigiLockerModuleService();
