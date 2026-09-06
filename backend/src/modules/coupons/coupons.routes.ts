import { Router } from "express";
import { CouponsController } from "./coupons.controller";
import { authenticateToken } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { listApplicableCouponsSchema, validateCouponSchema } from "./coupons.validation";

const router = Router();
const couponsController = new CouponsController();

router.get("/applicable", authenticateToken, validateRequest(listApplicableCouponsSchema), couponsController.listApplicable.bind(couponsController));
router.post("/validate", authenticateToken, validateRequest(validateCouponSchema), couponsController.validate.bind(couponsController));

export default router;
