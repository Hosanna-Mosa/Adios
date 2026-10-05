import { NextFunction, Request, Response } from "express";
import { verificationService } from "./verification.service";

/** Thin handlers; NotFoundError and friends reach the global error handler via next(). */
export class VerificationController {
  async listDrivers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await verificationService.listDrivers(req.query.status as string | undefined);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async approveDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await verificationService.approveDriver(String(req.params.id));
      return res.json({ message: "Driver approved", driver });
    } catch (error) {
      next(error);
    }
  }

  async rejectDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await verificationService.rejectDriver(String(req.params.id), req.body?.reason);
      return res.json({ message: "Driver rejected", driver });
    } catch (error) {
      next(error);
    }
  }

  async requestDriverDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await verificationService.requestDriverDocuments(
        String(req.params.id),
        req.body.documents,
        req.body.note
      );
      return res.json({ message: "Documents requested from driver", driver });
    } catch (error) {
      next(error);
    }
  }

  async listVendors(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await verificationService.listVendors(req.query.status as string | undefined);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async approveVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await verificationService.approveVendor(String(req.params.id));
      return res.json({ message: "Restaurant approved", vendorId: vendor._id });
    } catch (error) {
      next(error);
    }
  }

  async rejectVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await verificationService.rejectVendor(String(req.params.id), req.body?.reason);
      return res.json({ message: "Restaurant rejected", vendorId: vendor._id });
    } catch (error) {
      next(error);
    }
  }

  async requestVendorDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await verificationService.requestVendorDocuments(
        String(req.params.id),
        req.body.documents,
        req.body.note
      );
      return res.json({ message: "Documents requested from restaurant", vendorId: vendor._id });
    } catch (error) {
      next(error);
    }
  }
}

export const verificationController = new VerificationController();
