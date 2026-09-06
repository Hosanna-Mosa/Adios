import { Response, NextFunction } from "express";
import { CouponsService } from "./coupons.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { AppError, UnauthorizedError, ValidationError } from "../../utils/errors";

const couponsService = new CouponsService();

export class CouponsController {
  async listApplicable(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError("User is not authenticated");
      }

      const subtotal = Number(req.query.subtotal) || 0;
      const vendorId = req.query.vendorId ? String(req.query.vendorId) : undefined;

      const coupons = await couponsService.listApplicable(subtotal, vendorId);
      return res.json({ coupons });
    } catch (error) {
      next(error);
    }
  }

  async validate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError("User is not authenticated");
      }

      const { code, vendorId, subtotal } = req.body;
      const { coupon, discountAmount } = await couponsService.resolveForCart(code, Number(subtotal) || 0, vendorId);

      return res.json({ valid: true, code: coupon.code, discountAmount });
    } catch (error: any) {
      // Every rejection on this endpoint answers 400 { message }, including an unknown code.
      if (error instanceof AppError && error.statusCode === 404) {
        return next(new ValidationError(error.message));
      }
      next(error);
    }
  }
}
