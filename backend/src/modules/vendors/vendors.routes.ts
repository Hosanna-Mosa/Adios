import { Router } from "express";
import { authenticateToken, authorizeRole } from "../../middleware/auth.middleware";
import { UserRole } from "../../database/models/User";
import { getNearbyVendors, getVendorById, createVendor, searchGooglePlaces, getPlaceDetails, loginVendor, saveVendorOnboarding, changeVendorPassword, forgotVendorPassword, resetVendorPassword, updateVendor, deleteVendor, requestVendorPayout, getOutletOrderingStatus } from "./vendors.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import { authRateLimiter } from "../../middleware/rateLimit.middleware";
import {
  forgotVendorPasswordSchema,
  resetVendorPasswordSchema,
  nearbyVendorsSchema,
  vendorIdParamSchema,
  loginVendorSchema,
  createVendorSchema,
  updateVendorSchema,
  saveVendorOnboardingSchema,
  searchGooglePlacesSchema,
  changeVendorPasswordSchema,
  placeDetailsParamSchema,
  requestVendorPayoutSchema,
  startOnboardingDigilockerSchema,
  onboardingDigilockerResultSchema,
  vendorApplicationSchema,
  resubmitVendorDocumentsSchema,
  setMyOpenStateSchema,
  partnerPushTokenSchema,
  updateMyVendorProfileSchema,
} from "./vendors.validation";
import {
  digilockerRateLimit,
  digilockerSessionRateLimit,
  verifyDigilockerEnabled,
} from "../../middleware/digilocker.middleware";
import {
  getOnboardingApplication,
  getOnboardingDigilockerResult,
  resubmitOnboardingDocuments,
  startOnboardingDigilocker,
} from "./vendor-verification.controller";
import { getMyVendorProfile, registerMyPushToken, removeMyPushToken, setMyOpenState, updateMyVendorProfile } from "./vendor-profile.controller";
import { getMyPayouts } from "./vendor-payouts.controller";

const router = Router();

router.get("/nearby", validateRequest(nearbyVendorsSchema), getNearbyVendors);
router.get("/search-google", validateRequest(searchGooglePlacesSchema), searchGooglePlaces);
router.get("/place-details/:placeId", validateRequest(placeDetailsParamSchema), getPlaceDetails);
// The signed-in outlet's own profile (partner app). Registered before /:id so "me" is never read as an id.
router.get("/me", authenticateToken, getMyVendorProfile);
router.put("/me", authenticateToken, validateRequest(updateMyVendorProfileSchema), updateMyVendorProfile);
router.put("/me/open", authenticateToken, validateRequest(setMyOpenStateSchema), setMyOpenState);
router.get("/me/payouts", authenticateToken, getMyPayouts);
router.post("/me/push-token", authenticateToken, validateRequest(partnerPushTokenSchema), registerMyPushToken);
router.delete("/me/push-token", authenticateToken, validateRequest(partnerPushTokenSchema), removeMyPushToken);
router.get("/:id", validateRequest(vendorIdParamSchema), getVendorById);
// Restaurants and meat centres alike — the customer menu reads it before adding to the cart.
router.get("/:id/ordering-state", validateRequest(vendorIdParamSchema), getOutletOrderingStatus);
router.post("/login", authRateLimiter, validateRequest(loginVendorSchema), loginVendor);
router.post("/onboarding", validateRequest(saveVendorOnboardingSchema), saveVendorOnboarding);
// Owner KYC through DigiLocker, for applicants who don't have an account yet.
router.post(
  "/onboarding/digilocker/session",
  verifyDigilockerEnabled,
  digilockerSessionRateLimit,
  validateRequest(startOnboardingDigilockerSchema),
  startOnboardingDigilocker
);
router.get(
  "/onboarding/digilocker/session/:sessionId",
  verifyDigilockerEnabled,
  digilockerRateLimit,
  validateRequest(onboardingDigilockerResultSchema),
  getOnboardingDigilockerResult
);
// Applicant-facing status + document resubmission, gated by the portal password.
router.post("/onboarding/application", authRateLimiter, validateRequest(vendorApplicationSchema), getOnboardingApplication);
router.post("/onboarding/resubmit", authRateLimiter, validateRequest(resubmitVendorDocumentsSchema), resubmitOnboardingDocuments);
router.post("/", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(createVendorSchema), createVendor);
router.put("/change-password", authenticateToken, validateRequest(changeVendorPasswordSchema), changeVendorPassword);
router.post("/forgot-password", authRateLimiter, validateRequest(forgotVendorPasswordSchema), forgotVendorPassword);
router.post("/reset-password", authRateLimiter, validateRequest(resetVendorPasswordSchema), resetVendorPassword);
router.post("/payout", authenticateToken, validateRequest(requestVendorPayoutSchema), requestVendorPayout);
router.put("/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(updateVendorSchema), updateVendor);
router.delete("/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(vendorIdParamSchema), deleteVendor);

export default router;

