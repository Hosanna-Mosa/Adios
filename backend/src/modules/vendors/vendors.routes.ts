import { Router } from "express";
import { authenticateToken, authorizeRole } from "../../middleware/auth.middleware";
import { UserRole } from "../../database/models/User";
import { getNearbyVendors, getVendorById, createVendor, searchGooglePlaces, getPlaceDetails, loginVendor, saveVendorOnboarding, changeVendorPassword, forgotVendorPassword, resetVendorPassword, updateVendor, deleteVendor, requestVendorPayout } from "./vendors.controller";
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
} from "./vendors.validation";

const router = Router();

router.get("/nearby", validateRequest(nearbyVendorsSchema), getNearbyVendors);
router.get("/search-google", validateRequest(searchGooglePlacesSchema), searchGooglePlaces);
router.get("/place-details/:placeId", validateRequest(placeDetailsParamSchema), getPlaceDetails);
router.get("/:id", validateRequest(vendorIdParamSchema), getVendorById);
router.post("/login", authRateLimiter, validateRequest(loginVendorSchema), loginVendor);
router.post("/onboarding", validateRequest(saveVendorOnboardingSchema), saveVendorOnboarding);
router.post("/", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(createVendorSchema), createVendor);
router.put("/change-password", authenticateToken, validateRequest(changeVendorPasswordSchema), changeVendorPassword);
router.post("/forgot-password", authRateLimiter, validateRequest(forgotVendorPasswordSchema), forgotVendorPassword);
router.post("/reset-password", authRateLimiter, validateRequest(resetVendorPasswordSchema), resetVendorPassword);
router.post("/payout", authenticateToken, validateRequest(requestVendorPayoutSchema), requestVendorPayout);
router.put("/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(updateVendorSchema), updateVendor);
router.delete("/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(vendorIdParamSchema), deleteVendor);

export default router;

