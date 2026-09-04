import { Router } from "express";
import { authenticateToken, authorizeRole } from "../../middleware/auth.middleware";
import { UserRole } from "../../database/models/User";
import {
  getNearbyMeatCenters,
  createMeatCenter,
  loginMeatCenter,
  updateGlobalMeatPrices,
  getGlobalMeatPrices,
  getMeatCenterMenu,
  getVendorMeatMenu,
  updateMeatItemAvailability,
  updateMeatItemPrice,
  changeMeatVendorPassword,
  forgotMeatVendorPassword,
  resetMeatVendorPassword,
  updateMeatCenter,
  deleteMeatCenter
} from "./meat.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import { authRateLimiter } from "../../middleware/rateLimit.middleware";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  loginMeatCenterSchema,
  nearbyMeatCentersSchema,
  createMeatCenterSchema,
  meatCenterIdParamSchema,
  updateMeatCenterSchema,
  updateGlobalMeatPricesSchema,
  meatCenterMenuParamSchema,
  vendorMeatMenuParamSchema,
  updateMeatItemAvailabilitySchema,
  updateMeatItemPriceSchema,
  changeMeatVendorPasswordSchema,
} from "./meat.validation";

const router = Router();

router.post("/login", authRateLimiter, validateRequest(loginMeatCenterSchema), loginMeatCenter);
router.get("/nearby", validateRequest(nearbyMeatCentersSchema), getNearbyMeatCenters);
router.post("/", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(createMeatCenterSchema), createMeatCenter);
router.put("/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(updateMeatCenterSchema), updateMeatCenter);
router.delete("/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(meatCenterIdParamSchema), deleteMeatCenter);


// Global Price Management (Admin)
router.get("/menu/global", getGlobalMeatPrices);
router.put("/global-prices", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(updateGlobalMeatPricesSchema), updateGlobalMeatPrices);


// Menu (Customer App)
router.get("/menu/:centerId", validateRequest(meatCenterMenuParamSchema), getMeatCenterMenu);

// Forgot / Reset Password
router.post("/forgot-password", authRateLimiter, validateRequest(forgotPasswordSchema), forgotMeatVendorPassword);
router.post("/reset-password", authRateLimiter, validateRequest(resetPasswordSchema), resetMeatVendorPassword);

// Menu & Pricing (Vendor Dashboard) — auth-protected
router.get("/vendor-menu/:centerId", authenticateToken, validateRequest(vendorMeatMenuParamSchema), getVendorMeatMenu);
router.put("/items/:itemId/availability", authenticateToken, validateRequest(updateMeatItemAvailabilitySchema), updateMeatItemAvailability);
router.put("/items/:itemId/price", authenticateToken, validateRequest(updateMeatItemPriceSchema), updateMeatItemPrice);
router.put("/change-password", authenticateToken, validateRequest(changeMeatVendorPasswordSchema), changeMeatVendorPassword);

export default router;
