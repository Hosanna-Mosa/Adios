import { Router } from "express";
import { OrdersController } from "./orders.controller";
import { authenticateToken, authorizeRole } from "../../middleware/auth.middleware";
import { UserRole } from "../../database/models/User";
import { validateRequest } from "../../middleware/validation.middleware";
import { 
  createOrderSchema, 
  estimateFareSchema, 
  requestScheduledDeliverySchema, 
  respondScheduledDeliverySchema,
  scheduleDecisionSchema,
  cashCollectedSchema,
  vendorOrdersQuerySchema,
  restaurantAcceptSchema,
  helperQuoteSchema,
} from "./orders.validation";

const router = Router();
const ordersController = new OrdersController();

// Create order - simplifying route to / for easier frontend integration
router.post("/validate-coupon", authenticateToken, ordersController.validateCoupon.bind(ordersController));
router.post("/", authenticateToken, validateRequest(createOrderSchema), ordersController.create.bind(ordersController));
router.post("/scheduled-delivery-request", authenticateToken, validateRequest(requestScheduledDeliverySchema), ordersController.requestScheduledDelivery.bind(ordersController));
router.get("/scheduled", authenticateToken, authorizeRole([UserRole.ADMIN]), ordersController.getScheduledOrders.bind(ordersController));
router.get("/scheduled-delivery/vendor/:vendorId", authenticateToken, ordersController.getVendorScheduledDeliveries.bind(ordersController));
router.get("/scheduled-delivery/:requestId/status", authenticateToken, ordersController.getScheduledDeliveryStatus.bind(ordersController));
router.patch("/scheduled-delivery/:requestId/respond", authenticateToken, validateRequest(respondScheduledDeliverySchema), ordersController.respondScheduledDelivery.bind(ordersController));
router.get("/driver/scheduled", authenticateToken, authorizeRole([UserRole.DRIVER]), ordersController.getDriverScheduledOrders.bind(ordersController));
router.get("/driver/food-offer", authenticateToken, authorizeRole([UserRole.DRIVER]), ordersController.currentFoodOffer.bind(ordersController));
// The job a driver is on — the app restores it after a restart. Before /:id so "driver" isn't read as an id.
router.get("/driver/active", authenticateToken, authorizeRole([UserRole.DRIVER]), ordersController.driverActiveOrder.bind(ordersController));
router.get("/", authenticateToken, ordersController.getUserOrders.bind(ordersController));
router.get("/helper-quote", authenticateToken, validateRequest(helperQuoteSchema), ordersController.helperQuote.bind(ordersController));
router.get("/estimate-fare", authenticateToken, validateRequest(estimateFareSchema), ordersController.estimateFare.bind(ordersController));
router.get("/vendor/:vendorId", authenticateToken, validateRequest(vendorOrdersQuerySchema), ordersController.getVendorOrders.bind(ordersController));
router.get("/:id", authenticateToken, ordersController.getOrder.bind(ordersController));
router.get("/:id/chat", authenticateToken, ordersController.getChatHistory.bind(ordersController));
router.get("/:id/invoice", authenticateToken, ordersController.getInvoice.bind(ordersController));
router.patch("/:id/schedule", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(scheduleDecisionSchema), ordersController.respondToOrderSchedule.bind(ordersController));
router.post("/:id/reorder", authenticateToken, ordersController.reorder.bind(ordersController));
router.patch("/:id/increase-price", authenticateToken, ordersController.increasePrice.bind(ordersController));
router.post("/:id/decline", authenticateToken, authorizeRole([UserRole.DRIVER]), ordersController.decline.bind(ordersController));
router.patch("/:id/status", authenticateToken, ordersController.updateStatus.bind(ordersController));
router.post("/:id/confirm-assign", authenticateToken, ordersController.confirmAssign.bind(ordersController));
router.post("/:id/accept", authenticateToken, authorizeRole([UserRole.DRIVER]), ordersController.accept.bind(ordersController));
router.post("/:id/restaurant-accept", authenticateToken, validateRequest(restaurantAcceptSchema), ordersController.restaurantAccept.bind(ordersController));
router.post("/:id/cash-collected", authenticateToken, authorizeRole([UserRole.DRIVER]), validateRequest(cashCollectedSchema), ordersController.cashCollected.bind(ordersController));
router.post("/:id/sos", authenticateToken, ordersController.triggerSOS.bind(ordersController));

export default router;
