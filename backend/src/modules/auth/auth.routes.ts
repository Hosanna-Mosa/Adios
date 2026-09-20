import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import { authenticateToken } from "../../middleware/auth.middleware";
import { authRateLimiter } from "../../middleware/rateLimit.middleware";
import { requestOtpSchema, verifyOtpSchema, loginWithPasswordSchema } from "./auth.validation";

const router = Router();
const authController = new AuthController();

router.post("/request-otp", authRateLimiter, validateRequest(requestOtpSchema), authController.requestOTP.bind(authController));
router.post("/verify-otp", authRateLimiter, validateRequest(verifyOtpSchema), authController.verifyOTP.bind(authController));
router.post("/login-password", authRateLimiter, validateRequest(loginWithPasswordSchema), authController.loginWithPassword.bind(authController));
router.post("/logout", authController.logout.bind(authController));
router.post("/logout-all", authenticateToken, authController.logoutAll.bind(authController));
router.get("/version-check", authController.versionCheck.bind(authController));

export default router;
