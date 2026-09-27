import { Response, NextFunction } from "express";
import { AnalyticsService } from "./analytics.service";
import { AuthRequest } from "../../middleware/auth.middleware";

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  /**
   * POST /analytics/events — batched ingest from the customer and driver apps.
   * Always answers 202: the apps never retry on an error response or show one,
   * since losing a metric is acceptable and breaking a screen is not.
   */
  async ingest(req: AuthRequest, res: Response) {
    try {
      const accepted = await analyticsService.ingest(req.body.events, {
        userId: req.user?.userId,
        role: req.user?.role,
      });
      return res.status(202).json({ accepted });
    } catch (error) {
      console.error("[Analytics] ingest failed:", error);
      return res.status(202).json({ accepted: 0 });
    }
  }

  async getLiveActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const minutes = req.query.minutes ? Number(req.query.minutes) : undefined;
      return res.json(await analyticsService.getLiveActivity(minutes));
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? Number(req.query.days) : undefined;
      return res.json(await analyticsService.getSummary(days));
    } catch (error) {
      next(error);
    }
  }
}
