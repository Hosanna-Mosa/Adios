import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import * as controller from "./supportBot.controller";
import { askSchema, feedbackSchema, listIntentsSchema, listOrdersSchema, queryIdSchema } from "./supportBot.validation";

// Mounted at /api/v1/support/bot (before /api/v1/support, so "bot" is never read as a ticket id).
const router = Router();

router.get("/intents", authenticateToken, validateRequest(listIntentsSchema), controller.listIntents);
router.get("/orders", authenticateToken, validateRequest(listOrdersSchema), controller.listOrders);
router.post("/ask", authenticateToken, validateRequest(askSchema), controller.ask);
router.get("/queries/:id", authenticateToken, validateRequest(queryIdSchema), controller.getQuery);
router.post("/queries/:id/feedback", authenticateToken, validateRequest(feedbackSchema), controller.feedback);
router.post("/queries/:id/escalate", authenticateToken, validateRequest(queryIdSchema), controller.escalate);

export default router;
