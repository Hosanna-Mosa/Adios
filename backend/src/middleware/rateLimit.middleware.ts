import rateLimit from "express-rate-limit";

// Brute-force / OTP-spam protection for login and credential-recovery endpoints.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later" },
});
