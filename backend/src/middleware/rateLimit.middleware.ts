import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { AuthRequest } from "./auth.middleware";

// Brute-force / OTP-spam protection for login and credential-recovery endpoints.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 10 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later" },
});

// Analytics ingest: a client flushes every 10 s (6/min), plus on backgrounding.
// Keyed by the signed-in user where there is one (run optionalAuth first) —
// the app does not set `trust proxy`, so behind a reverse proxy every request
// shares one IP and a per-IP limit would throttle all users together.
// Signed-out traffic (before login) falls back to IP with a wider allowance.
export const analyticsRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: (req) => ((req as AuthRequest).user?.userId ? 60 : 600),
  keyGenerator: (req) => {
    const userId = (req as AuthRequest).user?.userId;
    return userId ? `user:${userId}` : ipKeyGenerator(req.ip ?? "");
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many analytics requests" },
});
