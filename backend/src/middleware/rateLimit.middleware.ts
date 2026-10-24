import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { AuthRequest } from "./auth.middleware";
import { isDevEnv } from "../utils/env";

// Brute-force / OTP-spam protection for login and credential-recovery endpoints.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // Strict unless this is explicitly a dev box (an unset NODE_ENV stays strict).
  max: isDevEnv() ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later" },
});

// Analytics ingest: a client flushes every 10 s (6/min), plus on backgrounding.
// Keyed by the signed-in user where there is one (run optionalAuth first) —
// unless TRUST_PROXY is set (see index.ts), behind a reverse proxy every request
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

// Routes that call a billed Google Maps API (places, geocoding, directions) on
// every request. They stay reachable signed out — the apps' address pickers and
// the admin's place search call some of them without a session — so the limit
// is what stops a script from running up the Maps bill. Keyed like analytics
// (run optionalAuth first); a typing user debounces autocomplete to well under
// one call a second.
export const mapsRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: (req) => ((req as AuthRequest).user?.userId ? 60 : 120),
  keyGenerator: (req) => {
    const userId = (req as AuthRequest).user?.userId;
    return userId ? `user:${userId}` : ipKeyGenerator(req.ip ?? "");
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many location requests, please slow down" },
});

// Public partner-site onboarding save (POST /vendors/onboarding). An applicant
// saves a draft a handful of times; this caps scripted spam of new applications.
export const onboardingRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevEnv() ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later" },
});
