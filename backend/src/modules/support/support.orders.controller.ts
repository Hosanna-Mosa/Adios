import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { supportOrderSearchQuery } from "./support.validation";
import { getSupportOrder, getSupportOrderChat, searchSupportOrders } from "./support.orders.service";

// Read-only order access for the support desk (admin + support roles). Every
// response goes through support.orders.view.ts, which masks phone numbers and
// leaves out the handover codes.
export class SupportOrdersController {
  async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = supportOrderSearchQuery.parse(req.query);
      return res.json(await searchSupportOrders(query, req.user!));
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      return res.json(await getSupportOrder(String(req.params.id), req.user!));
    } catch (error) {
      next(error);
    }
  }

  async getChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      return res.json(await getSupportOrderChat(String(req.params.id), req.user!));
    } catch (error) {
      next(error);
    }
  }
}
