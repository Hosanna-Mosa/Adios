import { Router } from "express";
import { OnboardingController } from "./onboarding.controller";
import { authenticateToken, authorizeRole } from "../../middleware/auth.middleware";
import { UserRole } from "../../database/models/User";
import { validateRequest } from "../../middleware/validation.middleware";
import {
  saveOnboardingSchema,
  verifyAadhaarSchema,
  verifyPanSchema,
  digilockerAuthUrlSchema,
  verifyDigilockerSchema,
} from "./onboarding.validation";

const router = Router();
const onboardingController = new OnboardingController();

// All onboarding routes require authentication + DRIVER role
router.patch(
  "/",
  authenticateToken,
  authorizeRole([UserRole.DRIVER]),
  validateRequest(saveOnboardingSchema),
  onboardingController.save.bind(onboardingController)
);

router.get(
  "/",
  authenticateToken,
  authorizeRole([UserRole.DRIVER]),
  onboardingController.status.bind(onboardingController)
);

router.post(
  "/verify-aadhaar",
  authenticateToken,
  authorizeRole([UserRole.DRIVER]),
  validateRequest(verifyAadhaarSchema),
  onboardingController.verifyAadhaar.bind(onboardingController)
);

router.post(
  "/verify-pan",
  authenticateToken,
  authorizeRole([UserRole.DRIVER]),
  validateRequest(verifyPanSchema),
  onboardingController.verifyPAN.bind(onboardingController)
);

router.post(
  "/complete",
  authenticateToken,
  authorizeRole([UserRole.DRIVER]),
  onboardingController.complete.bind(onboardingController)
);

router.get(
  "/digilocker/auth-url",
  authenticateToken,
  authorizeRole([UserRole.DRIVER]),
  validateRequest(digilockerAuthUrlSchema),
  onboardingController.getDigilockerAuthUrl.bind(onboardingController)
);

router.post(
  "/verify-digilocker",
  authenticateToken,
  authorizeRole([UserRole.DRIVER]),
  validateRequest(verifyDigilockerSchema),
  onboardingController.verifyDigilocker.bind(onboardingController)
);

export default router;
