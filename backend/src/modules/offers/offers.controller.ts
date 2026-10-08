import { Request, Response, NextFunction } from "express";
import { OffersService } from "./offers.service";

const offersService = new OffersService();

export class OffersController {
  /** GET /api/v1/offers — public list for the customer app's Offers page. */
  async getActiveOffers(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await offersService.listActiveOffers();
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
