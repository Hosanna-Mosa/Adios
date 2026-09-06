import { Response, NextFunction } from "express";
import { CartService } from "./cart.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { UnauthorizedError } from "../../utils/errors";

export class CartController {
  private cartService = new CartService();

  async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("User is not authenticated");
      }

      const cart = await this.cartService.getCart(userId);
      return res.json(cart);
    } catch (error) {
      next(error);
    }
  }

  async saveCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("User is not authenticated");
      }

      const { vendorId, items } = req.body;
      const cart = await this.cartService.saveCart(userId, vendorId ?? null, items ?? []);
      return res.json(cart);
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("User is not authenticated");
      }

      await this.cartService.clearCart(userId);
      return res.json({ vendorId: null, items: [] });
    } catch (error) {
      next(error);
    }
  }
}
