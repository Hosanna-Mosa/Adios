import { Router } from "express";
import { SupportController } from "./support.controller";
import { authenticateToken } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { createTicketSchema, sendReplySchema, resolveTicketSchema } from "./support.validation";

const router = Router();
const supportController = new SupportController();

router.get("/tickets", authenticateToken, supportController.getTickets.bind(supportController));
router.post("/tickets", authenticateToken, validateRequest(createTicketSchema), supportController.createTicket.bind(supportController));
router.post("/tickets/:id/messages", authenticateToken, validateRequest(sendReplySchema), supportController.sendReply.bind(supportController));
router.post("/tickets/:id/resolve", authenticateToken, validateRequest(resolveTicketSchema), supportController.resolveTicket.bind(supportController));

export default router;
