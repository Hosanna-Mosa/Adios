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

// Places search / route optimizing call paid Google Maps APIs, and some app screens call them
// before sign-in, so they cannot require a token. Keyed by the signed-in user where there is one
// (run optionalAuth first); signed-out traffic shares an IP-wide allowance, wider because the
// app does not set `trust proxy` and a reverse proxy makes many users look like one IP.
export const mapsRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: (req) => ((req as AuthRequest).user?.userId ? 120 : 300),
  keyGenerator: (req) => {
    const userId = (req as AuthRequest).user?.userId;
    return userId ? `user:${userId}` : ipKeyGenerator(req.ip ?? "");
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please slow down" },
});

// POST /auth/refresh runs every ~15 minutes per signed-in device, so it needs far more room than
// the login limiter. The token itself is the credential; this only caps guessing and runaway loops.
export const refreshRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 120 : 1000,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? ""),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please slow down" },
});
