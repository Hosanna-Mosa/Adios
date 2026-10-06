import { Request, Response } from "express";
import Vendor from "../../database/models/Vendor";
import { AppError } from "../../utils/errors";
import { digilockerModuleService } from "../digilocker/digilocker.service";
import { getSandboxRequestOrigin } from "../digilocker/digilocker.controller";
import {
  claimDigilockerKyc,
  findVendorByCredentials,
  legalUpdateFor,
  missingDocumentFields,
  toApplicationSummary,
  toVendorKycFields,
} from "./vendor-verification.service";

/**
 * Public partner-website endpoints for document verification.
 *
 * The applicant has no vendor-portal session here: DigiLocker results are
 * bound to a random access key held by the browser that started consent, and
 * the resubmission endpoints re-check the portal password on every call.
 */

/** Header carrying the access key minted with a restaurant-onboarding DigiLocker session. */
const ACCESS_KEY_HEADER = "x-digilocker-key";

function sendError(res: Response, error: any, fallback: string) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  console.error(fallback, error);
  return res.status(500).json({ message: "Internal server error" });
}

/** POST /vendors/onboarding/digilocker/session — start owner KYC consent. */
export const startOnboardingDigilocker = async (req: Request, res: Response) => {
  try {
    const result = await digilockerModuleService.startVendorOnboardingSession({
      persona: req.body?.persona,
      verifiedMobile: req.body?.verifiedMobile,
      requestOrigin: getSandboxRequestOrigin(req),
    });
    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    return sendError(res, error, "Error starting vendor DigiLocker session:");
  }
};

/** GET /vendors/onboarding/digilocker/session/:sessionId — poll for the result. */
export const getOnboardingDigilockerResult = async (req: Request, res: Response) => {
  try {
    const result = await digilockerModuleService.getVendorOnboardingResult(
      String(req.params.sessionId),
      req.get(ACCESS_KEY_HEADER) || undefined
    );
    res.setHeader("Cache-Control", "no-store, private");
    return res.json({ success: true, ...result });
  } catch (error) {
    return sendError(res, error, "Error reading vendor DigiLocker session:");
  }
};

/** POST /vendors/onboarding/application — the applicant's own status and requested documents. */
export const getOnboardingApplication = async (req: Request, res: Response) => {
  try {
    const vendor = await findVendorByCredentials(req.body);
    if (!vendor) return res.status(401).json({ message: "Invalid email/phone or password" });

    res.setHeader("Cache-Control", "no-store, private");
    return res.json({ application: toApplicationSummary(vendor) });
  } catch (error) {
    return sendError(res, error, "Error fetching vendor application:");
  }
};

/**
 * POST /vendors/onboarding/resubmit — replace the documents an admin asked for
 * and send the application back for review. Only the requested document
 * groups are read from the body; everything else on the record is kept.
 */
export const resubmitOnboardingDocuments = async (req: Request, res: Response) => {
  try {
    const vendor = await findVendorByCredentials(req.body);
    if (!vendor) return res.status(401).json({ message: "Invalid email/phone or password" });

    if (vendor.onboardingStatus !== "resubmission_required") {
      return res.status(409).json({
        message: "No documents have been requested for this application.",
        application: toApplicationSummary(vendor),
      });
    }

    const requested = vendor.verificationReview?.requestedDocuments || [];
    const payload = req.body?.documents || {};
    const vendorId = String(vendor._id);

    // A fresh DigiLocker consent replaces the stored identity; otherwise the
    // existing verified identity still backs the PAN check below.
    const freshKyc = await claimDigilockerKyc(payload, vendorId);
    const kyc = freshKyc || (vendor.kyc?.digilockerVerified ? vendor.kyc : null);

    const missing = requested.flatMap((document) =>
      missingDocumentFields(document, payload, document === "identity" ? freshKyc : kyc)
    );
    if (missing.length > 0) {
      return res.status(400).json({ message: `Please complete required fields: ${missing.join(", ")}`, missing });
    }

    const now = new Date();
    const update: Record<string, unknown> = {
      onboardingStatus: "submitted",
      submittedAt: now,
      "verificationReview.resubmittedAt": now,
    };
    for (const document of requested) Object.assign(update, legalUpdateFor(document, payload, kyc));
    if (freshKyc) {
      update.kyc = toVendorKycFields(freshKyc);
      // The PAN already on file may now match (or no longer match) the new identity.
      if (!requested.includes("pan")) {
        update["legal.panVerified"] = Boolean(freshKyc.panNumber && vendor.legal?.panNumber === freshKyc.panNumber);
      }
    }

    const updated = await Vendor.findByIdAndUpdate(vendor._id, { $set: update }, { new: true, runValidators: true });

    return res.json({
      message: "Documents resubmitted. Our team will review your application again.",
      application: updated ? toApplicationSummary(updated) : null,
    });
  } catch (error) {
    return sendError(res, error, "Error resubmitting vendor documents:");
  }
};
