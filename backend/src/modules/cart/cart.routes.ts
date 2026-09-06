import { Router } from "express";
import { CartController } from "./cart.controller";
import { authenticateToken } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { saveCartSchema } from "./cart.validation";

const router = Router();
const cartController = new CartController();

router.get("/", authenticateToken, cartController.getCart.bind(cartController));
router.put("/", authenticateToken, validateRequest(saveCartSchema), cartController.saveCart.bind(cartController));
router.delete("/", authenticateToken, cartController.clearCart.bind(cartController));

export default router;
