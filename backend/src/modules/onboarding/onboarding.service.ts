import Driver, { OnboardingStatus, IDriver } from "../../database/models/Driver";
import { surepassService } from "../../services/surepass.service";
import { digilockerModuleService } from "../digilocker/digilocker.service";
import DigiLockerSession, { DigiLockerPurpose, DigiLockerSessionStatus } from "../../database/models/DigiLockerSession";
import { AppError } from "../../utils/errors";
import User from "../../database/models/User";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export class OnboardingService {
  /**
   * Find or create a Driver record for the given user.
   * Driver is created on first save (not on signup).
   */
  private async getOrCreateDriver(userId: string): Promise<IDriver> {
    let driver = await Driver.findOne({ user: userId });
    if (!driver) {
      driver = new Driver({
        user: userId,
        onboardingStatus: OnboardingStatus.IN_PROGRESS,
      });
      await driver.save();
    }
    return driver;
  }

  /**
   * Save onboarding data incrementally.
   * Merges provided fields with existing data.
   * If Driver doesn't exist yet, creates it.
   */
  async saveOnboardingData(userId: string, data: Partial<IDriver> & { email?: string }) {
    // Contact email lives on the User; review outcomes are emailed to it.
    if (data.email !== undefined) {
      await this.saveEmail(userId, data.email);
    }

    const driver = await this.getOrCreateDriver(userId);

    // Starting (or restarting after a rejection) puts the driver in progress.
    // Approved, awaiting-review and resubmission statuses are left alone: this
    // endpoint is also how an approved driver adds a bank account later, and
    // that must not quietly take them off the road.
    if (
      driver.onboardingStatus === OnboardingStatus.NOT_STARTED ||
      driver.onboardingStatus === OnboardingStatus.REJECTED
    ) {
      driver.onboardingStatus = OnboardingStatus.IN_PROGRESS;
    }

    // Handle Aadhaar verification via Surepass
    if (data.aadhaarNumber && !data.aadhaarVerified) {
      const result = await surepassService.verifyAadhaar(data.aadhaarNumber, true);
      if (result.verified) {
        driver.aadhaarNumber = data.aadhaarNumber;
        driver.aadhaarVerified = true;
      } else {
        throw new Error(result.message || "Aadhaar verification failed");
      }
    }

    // Handle PAN verification via Surepass (only if not already saved)
    if (data.panNumber && !driver.panNumber) {
      const result = await surepassService.verifyPAN(data.panNumber, true);
      if (result.verified) {
        driver.panNumber = data.panNumber;
      } else {
        throw new Error(result.message || "PAN verification failed");
      }
    }

    // Merge other allowed fields
    const allowedFields = [
      "gender",
      "vehicleType",
      "preferredZone",
      "panImage",
      "dlNumber",
      "dlExpiry",
      "dlFrontImage",
      "dlBackImage",
      "bankAccountNumber",
      "bankIfsc",
      "bankVerified",
      "selfieImage",
    ] as const;

    for (const field of allowedFields) {
      if ((data as any)[field] !== undefined) {
        (driver as any)[field] = (data as any)[field];
      }
    }

    // If bank details were provided, also push to bankAccounts array (avoid duplicates)
    if (data.bankAccountNumber && data.bankIfsc) {
      const existing = (driver.bankAccounts || []).find(
        (ba) => ba.accountNumber === data.bankAccountNumber
      );
      if (!existing) {
        const bankAccounts = driver.bankAccounts || [];
        const isFirst = bankAccounts.length === 0;
        bankAccounts.push({
          accountNumber: data.bankAccountNumber,
          ifsc: data.bankIfsc,
          verified: data.bankVerified || false,
          isDefault: isFirst,
        });
        driver.bankAccounts = bankAccounts;
      }
    }

    await driver.save();

    return {
      onboardingStatus: driver.onboardingStatus,
      aadhaarVerified: driver.aadhaarVerified,
      savedFields: Object.keys(data).filter((k) =>
        allowedFields.includes(k as any) || k === "aadhaarNumber" || k === "panNumber" || k === "email"
      ),
    };
  }

  /** Validate and store the driver's contact email on their User record. */
  private async saveEmail(userId: string, raw: unknown) {
    const email = String(raw || "").trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      throw new AppError(400, "Please enter a valid email address.");
    }

    const taken = await User.exists({ email, _id: { $ne: userId } });
    if (taken) {
      throw new AppError(409, "This email is already used by another account. Please use a different one.");
    }

    await User.findByIdAndUpdate(userId, { email });
  }

  /**
   * Verify Aadhaar through Surepass (separate endpoint for on-demand verification).
   */
  async verifyAadhaar(userId: string, aadhaarNumber: string) {
    const driver = await this.getOrCreateDriver(userId);
    const result = await surepassService.verifyAadhaar(aadhaarNumber, true);

    if (result.verified) {
      driver.aadhaarNumber = aadhaarNumber;
      driver.aadhaarVerified = true;
      await driver.save();
    }

    return {
      verified: result.verified,
      message: result.message,
      data: result.data,
    };
  }

  /**
   * Verify PAN through Surepass (separate endpoint for on-demand verification).
   */
  async verifyPAN(userId: string, panNumber: string) {
    const driver = await this.getOrCreateDriver(userId);
    const result = await surepassService.verifyPAN(panNumber, true);

    if (result.verified) {
      driver.panNumber = panNumber;
      await driver.save();
    }

    return {
      verified: result.verified,
      message: result.message,
      data: result.data,
    };
  }

  /**
   * Get current driver's onboarding progress and all saved data.
   */
  async getOnboardingStatus(userId: string) {
    const [driver, user] = await Promise.all([
      Driver.findOne({ user: userId }),
      User.findById(userId).select("email").lean(),
    ]);
    // Lets the app pre-fill the (mandatory) contact email step.
    const email = user?.email || null;

    if (!driver) {
      return {
        onboardingStatus: OnboardingStatus.NOT_STARTED,
        email,
        data: null,
      };
    }

    return {
      onboardingStatus: driver.onboardingStatus,
      email,
      // What an admin asked for, so the app can show it on the review screen.
      verificationReview: driver.verificationReview || null,
      submittedForReviewAt: driver.submittedForReviewAt || null,
      data: {
        gender: driver.gender,
        vehicleType: driver.vehicleType,
        preferredZone: driver.preferredZone,
        aadhaarNumber: driver.aadhaarNumber,
        aadhaarVerified: driver.aadhaarVerified,
        panNumber: driver.panNumber,
        panVerified: driver.panVerified,
        panImage: driver.panImage,
        // Lets the driver app show how the identity was established, and skip
        // re-asking for documents DigiLocker already confirmed.
        kycSource: driver.kycSource,
        digilockerVerified: driver.digilockerVerified,
        digilockerVerifiedAt: driver.digilockerVerifiedAt,
        dlNumber: driver.dlNumber,
        dlExpiry: driver.dlExpiry,
        dlVerified: driver.dlVerified,
        dlVehicleClass: driver.dlVehicleClass,
        dlFrontImage: driver.dlFrontImage,
        dlBackImage: driver.dlBackImage,
        bankAccountNumber: driver.bankAccountNumber,
        bankIfsc: driver.bankIfsc,
        bankVerified: driver.bankVerified,
        selfieImage: driver.selfieImage,
      },
    };
  }

  /**
   * Finish the onboarding flow and send the application to an admin for
   * review. Only the admin's approval (Driver Verification page) moves a
   * driver to COMPLETED, which is what lets them go online.
   */
  async completeOnboarding(userId: string) {
    const driver = await Driver.findOne({ user: userId });

    if (!driver) {
      throw new Error("Driver not found. Please start onboarding first.");
    }

    // Already approved — finishing the flow again changes nothing.
    if (driver.onboardingStatus === OnboardingStatus.COMPLETED) {
      return {
        message: "Onboarding already approved",
        onboardingStatus: OnboardingStatus.COMPLETED,
      };
    }

    // Mandatory: the review outcome (approved / rejected with reason /
    // documents requested) is emailed, so there must be somewhere to send it.
    const user = await User.findById(userId).select("email").lean();
    if (!user?.email) {
      throw new AppError(
        400,
        "Please add your email address before submitting — we email you when your application is reviewed."
      );
    }

    // A resubmission must actually carry every document the admin asked for
    // again (the request cleared them from the record).
    if (driver.onboardingStatus === OnboardingStatus.RESUBMISSION_REQUIRED) {
      const present: Record<string, unknown> = {
        aadhaar: driver.aadhaarNumber,
        pan: driver.panNumber,
        license: driver.dlNumber,
        bank: driver.bankAccountNumber,
        selfie: driver.selfieImage,
      };
      const missing = (driver.verificationReview?.requestedDocuments || []).filter((doc) => !present[doc]);
      if (missing.length) {
        throw new AppError(400, `Please provide these documents again before resubmitting: ${missing.join(", ")}`);
      }
    }

    driver.onboardingStatus = OnboardingStatus.PENDING_APPROVAL;
    driver.onboardingCompletedAt = new Date();
    driver.submittedForReviewAt = new Date();
    await driver.save();

    return {
      message: "Onboarding submitted for verification",
      onboardingStatus: OnboardingStatus.PENDING_APPROVAL,
    };
  }

  /**
   * Start a DigiLocker consent flow and return the URL the driver opens.
   *
   * Delegates to the DigiLocker module, which mints the PKCE pair and persists
   * a pending session. The `state` is generated server-side and returned to the
   * caller — a client-supplied state is not honoured, because state is the CSRF
   * binding for the callback and must be unguessable by anyone but us.
   */
  async getDigilockerAuthUrl(userId: string) {
    const session = await digilockerModuleService.startSession(userId, {
      purpose: DigiLockerPurpose.KYC,
    });

    return {
      authUrl: session.authUrl,
      state: session.state,
      sessionId: session.sessionId,
      expiresAt: session.expiresAt,
      mode: session.mode,
      sandbox: session.sandbox,
    };
  }

  /**
   * Complete a DigiLocker consent flow and copy the verified identity onto the
   * driver record.
   *
   * `state` identifies which pending consent this code belongs to. It is
   * optional only for backward compatibility with the previous version of this
   * endpoint: when omitted we fall back to the caller's most recent pending
   * session, which is unambiguous because starting a new flow expires older ones.
   */
  async verifyDigilocker(userId: string, code: string, state?: string) {
    const session = state
      ? await DigiLockerSession.findOne({ state, user: userId })
      : await DigiLockerSession.findOne({
          user: userId,
          status: DigiLockerSessionStatus.PENDING,
        }).sort({ createdAt: -1 });

    if (!session) {
      throw new Error(
        "No pending DigiLocker verification found. Please start DigiLocker verification again."
      );
    }

    if (session.status !== DigiLockerSessionStatus.PENDING) {
      throw new Error(
        "This DigiLocker verification has already been completed. Please start again if you need to re-verify."
      );
    }

    await digilockerModuleService.completeConsent(session, code);

    const accessToken = session.getAccessToken();
    if (!accessToken) {
      throw new Error("DigiLocker did not return a usable access token. Please try again.");
    }

    const sync = await digilockerModuleService.syncToDriver(userId, session, accessToken);

    return {
      success: true,
      message: sync.synced
        ? "DigiLocker verification completed successfully"
        : "DigiLocker linked, but no Aadhaar or PAN document was available to import",
      sandbox: sync.sandbox,
      skipped: sync.skipped,
      data: {
        aadhaar: session.aadhaarData || null,
        pan: session.panData || null,
      },
    };
  }
}
