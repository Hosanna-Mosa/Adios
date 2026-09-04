import { Router } from "express";
import { ReviewsController } from "./reviews.controller";
import { authenticateToken } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { createReviewSchema, getReviewByOrderSchema } from "./reviews.validation";

const router = Router();
const reviewsController = new ReviewsController();

router.post("/", authenticateToken, validateRequest(createReviewSchema), reviewsController.createReview.bind(reviewsController));
router.get("/order/:orderId", authenticateToken, validateRequest(getReviewByOrderSchema), reviewsController.getReviewByOrder.bind(reviewsController));

export default router;
