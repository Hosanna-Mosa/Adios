import { Router } from "express";
import { SupportController } from "./support.controller";
import { SupportOrdersController } from "./support.orders.controller";
import { authenticateToken, authorizeRole } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { UserRole } from "../../database/models/User";
import { createTicketSchema, sendReplySchema, resolveTicketSchema, supportOrderSearchSchema, supportOrderIdSchema } from "./support.validation";

const router = Router();
const supportController = new SupportController();
const supportOrdersController = new SupportOrdersController();
const staffOnly = [authenticateToken, authorizeRole([UserRole.ADMIN, UserRole.SUPPORT])];

router.get("/tickets", authenticateToken, supportController.getTickets.bind(supportController));
router.post("/tickets", authenticateToken, validateRequest(createTicketSchema), supportController.createTicket.bind(supportController));
router.post("/tickets/:id/messages", authenticateToken, validateRequest(sendReplySchema), supportController.sendReply.bind(supportController));
router.post("/tickets/:id/resolve", authenticateToken, validateRequest(resolveTicketSchema), supportController.resolveTicket.bind(supportController));

// Support desk: view any order, read-only (phones masked, handover codes hidden).
router.get("/orders", ...staffOnly, validateRequest(supportOrderSearchSchema), supportOrdersController.search.bind(supportOrdersController));
router.get("/orders/:id", ...staffOnly, validateRequest(supportOrderIdSchema), supportOrdersController.getOne.bind(supportOrdersController));
router.get("/orders/:id/chat", ...staffOnly, validateRequest(supportOrderIdSchema), supportOrdersController.getChat.bind(supportOrdersController));

export default router;
