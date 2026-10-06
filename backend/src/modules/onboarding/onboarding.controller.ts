import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { OnboardingService } from "./onboarding.service";
import { AppError } from "../../utils/errors";

const onboardingService = new OnboardingService();

export class OnboardingController {
  /**
   * PATCH /api/v1/onboarding
   * Save onboarding data incrementally (merges with existing).
   */
  async save(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.user!;
      const data = req.body;

      const result = await onboardingService.saveOnboardingData(userId, data);
      return res.json(result);
    } catch (error: any) {
      console.error("[ONBOARDING] Save error:", error);
      // e.g. 400 invalid email, 409 email already used by another account.
      const status = error instanceof AppError ? error.statusCode : 500;
      return res.status(status).json({ message: error.message || "Internal server error" });
    }
  }

  /**
   * POST /api/v1/onboarding/verify-aadhaar
   * Verify Aadhaar through Surepass.
   */
  async verifyAadhaar(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.user!;
      const { aadhaarNumber } = req.body;

      if (!aadhaarNumber) {
        return res.status(400).json({ message: "Aadhaar number is required" });
      }

      const result = await onboardingService.verifyAadhaar(userId, aadhaarNumber);
      return res.json(result);
    } catch (error: any) {
      console.error("[ONBOARDING] Verify Aadhaar error:", error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  /**
   * POST /api/v1/onboarding/verify-pan
   * Verify PAN through Surepass.
   */
  async verifyPAN(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.user!;
      const { panNumber } = req.body;

      if (!panNumber) {
        return res.status(400).json({ message: "PAN number is required" });
      }

      const result = await onboardingService.verifyPAN(userId, panNumber);
      return res.json(result);
    } catch (error: any) {
      console.error("[ONBOARDING] Verify PAN error:", error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  /**
   * GET /api/v1/onboarding
   * Get current driver's onboarding status and saved data.
   */
  async status(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.user!;
      const result = await onboardingService.getOnboardingStatus(userId);
      return res.json(result);
    } catch (error: any) {
      console.error("[ONBOARDING] Status error:", error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  /**
   * POST /api/v1/onboarding/complete
   * Mark onboarding as completed.
   */
  async complete(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.user!;
      const result = await onboardingService.completeOnboarding(userId);
      return res.json(result);
    } catch (error: any) {
      console.error("[ONBOARDING] Complete error:", error);
      const status = error instanceof AppError ? error.statusCode : 500;
      return res.status(status).json({ message: error.message || "Internal server error" });
    }
  }

  /**
   * GET /api/v1/onboarding/digilocker/auth-url
   */
  async getDigilockerAuthUrl(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.user!;
      const result = await onboardingService.getDigilockerAuthUrl(userId);
      return res.json(result);
    } catch (error: any) {
      console.error("[ONBOARDING] Get DigiLocker auth URL error:", error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  /**
   * POST /api/v1/onboarding/verify-digilocker
   */
  async verifyDigilocker(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.user!;
      const { code, state } = req.body;

      if (!code) {
        return res.status(400).json({ message: "Authorization code is required" });
      }

      const result = await onboardingService.verifyDigilocker(userId, code, state);
      return res.json(result);
    } catch (error: any) {
      console.error("[ONBOARDING] Verify DigiLocker error:", error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }
}
