import { Response, NextFunction } from "express";
import { AnalyticsService, ItemStatsQuery } from "./analytics.service";
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

  async getTopItems(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? Number(req.query.days) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      return res.json(await analyticsService.getTopItems(days, limit));
    } catch (error) {
      next(error);
    }
  }

  async getItemStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const q = req.query;
      const query: ItemStatsQuery = {
        days: q.days ? Number(q.days) : undefined,
        vendorId: typeof q.vendorId === "string" && q.vendorId ? q.vendorId : undefined,
        search: typeof q.search === "string" ? q.search : undefined,
        sort: q.sort as ItemStatsQuery["sort"],
        order: q.order === "asc" ? "asc" : q.order === "desc" ? "desc" : undefined,
        page: q.page ? Number(q.page) : undefined,
        limit: q.limit ? Number(q.limit) : undefined,
      };
      return res.json(await analyticsService.getItemStats(query));
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
