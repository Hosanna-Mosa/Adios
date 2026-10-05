import Driver, {
  DriverResubmittableDocument,
  DriverStatus,
  IDriver,
  OnboardingStatus,
} from "../../database/models/Driver";
import Vendor, { VendorResubmittableDocument } from "../../database/models/Vendor";
import { NotificationService } from "../../services/notification.service";
import { sendDriverDecisionEmail, sendVendorDecisionEmail } from "./verification.emails";
import { NotFoundError } from "../../utils/errors";

/**
 * Admin review of new driver and restaurant applications.
 *
 * A driver finishing the app's onboarding lands in PENDING_APPROVAL and a
 * restaurant submitting the partner form lands in "submitted". From here an
 * admin approves it (the only way to go online / sign in to the vendor
 * portal), rejects it, or asks for specific documents again.
 */

export const DRIVER_REVIEW_STATUSES = [
  OnboardingStatus.PENDING_APPROVAL,
  OnboardingStatus.RESUBMISSION_REQUIRED,
  OnboardingStatus.REJECTED,
  OnboardingStatus.COMPLETED,
  OnboardingStatus.IN_PROGRESS,
] as const;

export const VENDOR_REVIEW_STATUSES = ["submitted", "resubmission_required", "rejected", "approved"] as const;

const DRIVER_DOCUMENT_LABELS: Record<DriverResubmittableDocument, string> = {
  aadhaar: "Aadhaar",
  pan: "PAN card",
  license: "Driving licence",
  bank: "Bank account",
  selfie: "Selfie",
};

/** Fire-and-forget push to the driver; a failed notification never fails the review. */
function notifyDriver(driver: IDriver, title: string, body: string, screen: string) {
  if (!driver.user) return;
  NotificationService.getInstance()
    .sendNotification({
      userId: driver.user.toString(),
      title,
      body,
      type: "alert",
      category: "system",
      data: { deepLink: { screen } },
    })
    .catch((err) => console.error("[verification] Failed to notify driver:", err));
}

// ── Drivers ────────────────────────────────────────────────────────────────

/** Clear what the driver must provide again, so the app asks for it afresh. */
function clearDriverDocument(driver: IDriver, document: DriverResubmittableDocument) {
  switch (document) {
    case "aadhaar":
      driver.set({ aadhaarNumber: undefined, aadhaarVerified: false, digilockerVerified: false });
      break;
    case "pan":
      driver.set({ panNumber: undefined, panVerified: false, panImage: undefined });
      break;
    case "license":
      driver.set({
        dlNumber: undefined,
        dlExpiry: undefined,
        dlVerified: false,
        dlVehicleClass: undefined,
        dlFrontImage: undefined,
        dlBackImage: undefined,
      });
      break;
    case "bank": {
      // Drop the rejected account from payout targets as well.
      const rejected = driver.bankAccountNumber;
      const remaining = (driver.bankAccounts || []).filter((account) => account.accountNumber !== rejected);
      if (remaining.length && !remaining.some((account) => account.isDefault)) remaining[0].isDefault = true;
      driver.set({ bankAccountNumber: undefined, bankIfsc: undefined, bankVerified: false, bankAccounts: remaining });
      break;
    }
    case "selfie":
      driver.set({ selfieImage: undefined });
      break;
  }
}

export class VerificationService {
  async listDrivers(status: string = OnboardingStatus.PENDING_APPROVAL) {
    const statuses = status === "all" ? [...DRIVER_REVIEW_STATUSES] : [status];

    const [drivers, counts] = await Promise.all([
      Driver.find({ onboardingStatus: { $in: statuses } })
        .populate("user", "name phone email profilePic createdAt")
        .populate("preferredZone", "name")
        .sort({ submittedForReviewAt: -1, updatedAt: -1 })
        .limit(500)
        .lean(),
      Driver.aggregate([
        { $match: { onboardingStatus: { $in: [...DRIVER_REVIEW_STATUSES] } } },
        { $group: { _id: "$onboardingStatus", count: { $sum: 1 } } },
      ]),
    ]);

    return {
      drivers,
      counts: Object.fromEntries(counts.map((row) => [row._id, row.count])),
    };
  }

  private async getDriver(id: string) {
    const driver = await Driver.findById(id);
    if (!driver) throw new NotFoundError("Driver not found");
    return driver;
  }

  async approveDriver(id: string) {
    const driver = await this.getDriver(id);

    driver.onboardingStatus = OnboardingStatus.COMPLETED;
    driver.verificationReview = { reviewedAt: new Date() };
    await driver.save();

    notifyDriver(
      driver,
      "You're approved to drive! 🎉",
      "Your documents have been verified. You can now go online and start accepting jobs.",
      "/(tabs)"
    );
    sendDriverDecisionEmail(driver, { kind: "approved" });
    return driver;
  }

  async rejectDriver(id: string, reason?: string) {
    const driver = await this.getDriver(id);

    driver.onboardingStatus = OnboardingStatus.REJECTED;
    driver.status = DriverStatus.OFFLINE;
    driver.verificationReview = { rejectionReason: reason, reviewedAt: new Date() };
    await driver.save();

    notifyDriver(
      driver,
      "Onboarding not approved",
      reason || "We couldn't verify your documents. Please contact support for details.",
      "/verification-status"
    );
    sendDriverDecisionEmail(driver, { kind: "rejected", reason });
    return driver;
  }

  async requestDriverDocuments(id: string, documents: DriverResubmittableDocument[], note?: string) {
    const driver = await this.getDriver(id);
    const unique = [...new Set(documents)];

    unique.forEach((document) => clearDriverDocument(driver, document));

    const now = new Date();
    driver.onboardingStatus = OnboardingStatus.RESUBMISSION_REQUIRED;
    // A driver asked for documents again stops taking jobs until re-approved.
    driver.status = DriverStatus.OFFLINE;
    driver.verificationReview = { requestedDocuments: unique, note, requestedAt: now, reviewedAt: now };
    await driver.save();

    notifyDriver(
      driver,
      "Documents needed",
      `Please upload again: ${unique.map((d) => DRIVER_DOCUMENT_LABELS[d]).join(", ")}.${note ? ` ${note}` : ""}`,
      "/verification-status"
    );
    sendDriverDecisionEmail(driver, { kind: "documents_requested", documents: unique, note });
    return driver;
  }

  // ── Vendors ──────────────────────────────────────────────────────────────

  async listVendors(status: string = "submitted") {
    const statuses = status === "all" ? [...VENDOR_REVIEW_STATUSES] : [status];

    const [vendors, counts] = await Promise.all([
      Vendor.find({ onboardingStatus: { $in: statuses } })
        .select("-password -webPushSubscriptions -operations")
        .sort({ submittedAt: -1, updatedAt: -1 })
        .limit(500)
        .lean(),
      Vendor.aggregate([
        { $match: { onboardingStatus: { $in: [...VENDOR_REVIEW_STATUSES] } } },
        { $group: { _id: "$onboardingStatus", count: { $sum: 1 } } },
      ]),
    ]);

    return {
      vendors,
      counts: Object.fromEntries(counts.map((row) => [row._id, row.count])),
    };
  }

  private async getVendor(id: string) {
    const vendor = await Vendor.findById(id);
    if (!vendor) throw new NotFoundError("Vendor not found");
    return vendor;
  }

  async approveVendor(id: string) {
    const vendor = await this.getVendor(id);

    vendor.onboardingStatus = "approved";
    vendor.verificationReview = { reviewedAt: new Date() };
    // The partner form can't check bank details; the admin reviewing the
    // application is what verifies them (shown as "verified" on Payouts).
    if (vendor.legal?.bankAccount && vendor.legal?.ifsc) vendor.set("legal.ifscVerified", true);
    await vendor.save();

    sendVendorDecisionEmail(vendor, { kind: "approved" });
    return vendor;
  }

  async rejectVendor(id: string, reason?: string) {
    const vendor = await this.getVendor(id);

    vendor.onboardingStatus = "rejected";
    vendor.verificationReview = { rejectionReason: reason, reviewedAt: new Date() };
    await vendor.save();

    sendVendorDecisionEmail(vendor, { kind: "rejected", reason });
    return vendor;
  }

  async requestVendorDocuments(id: string, documents: VendorResubmittableDocument[], note?: string) {
    const vendor = await this.getVendor(id);
    const unique = [...new Set(documents)];
    const now = new Date();

    vendor.onboardingStatus = "resubmission_required";
    vendor.verificationReview = { requestedDocuments: unique, note, requestedAt: now, reviewedAt: now };
    await vendor.save();

    sendVendorDecisionEmail(vendor, { kind: "documents_requested", documents: unique, note });
    return vendor;
  }
}

export const verificationService = new VerificationService();
