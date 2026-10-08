import { Router } from "express";
import { AnalyticsController } from "./analytics.controller";
import { authenticateToken, authorizeRole, optionalAuth } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { analyticsRateLimiter } from "../../middleware/rateLimit.middleware";
import { UserRole } from "../../database/models/User";
import { activitySummarySchema, ingestEventsSchema, itemStatsSchema, liveActivitySchema, topItemsSchema } from "./analytics.validation";

const router = Router();
const analyticsController = new AnalyticsController();

// Signed in or not — events before login (onboarding, the login screen itself)
// are some of the most useful. optionalAuth runs first so the limiter can key by user.
router.post("/events", optionalAuth, analyticsRateLimiter, validateRequest(ingestEventsSchema), analyticsController.ingest.bind(analyticsController));

router.get("/live", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(liveActivitySchema), analyticsController.getLiveActivity.bind(analyticsController));
router.get("/summary", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(activitySummarySchema), analyticsController.getSummary.bind(analyticsController));
router.get("/top-items", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(topItemsSchema), analyticsController.getTopItems.bind(analyticsController));
router.get("/items", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(itemStatsSchema), analyticsController.getItemStats.bind(analyticsController));

export default router;
