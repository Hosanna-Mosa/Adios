import { Router } from "express";
import { RoutingController } from "./routing.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import { optionalAuth } from "../../middleware/auth.middleware";
import { mapsRateLimiter } from "../../middleware/rateLimit.middleware";
import { optimizeRouteSchema } from "./routing.validation";

const router = Router();
const controller = new RoutingController();

router.post("/optimize", optionalAuth, mapsRateLimiter, validateRequest(optimizeRouteSchema), (req, res) => controller.optimize(req, res));

export default router;
