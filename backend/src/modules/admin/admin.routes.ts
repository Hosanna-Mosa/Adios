import { Router } from "express";
import { AdminController } from "./admin.controller";
import { authenticateToken, authorizeRole } from "../../middleware/auth.middleware";
import { UserRole } from "../../database/models/User";
import { validateRequest } from "../../middleware/validation.middleware";
import {
  idParamSchema,
  orderIdParamSchema,
  createUserSchema,
  updateUserSchema,
  updateDriverSchema,
  updateOrderSchema,
  createSupportTicketSchema,
  updateSupportTicketSchema,
  createSupportMemberSchema,
  resetSupportMemberPasswordSchema,
  createOrderSchema,
  updateSystemConfigSchema,
  createCouponSchema,
  updateAppVersionSchema,
  updateDevDriverSchema,
  createBannerSchema,
  updateBannerSchema,
  createOfferSchema,
  updateOfferSchema,
} from "./admin.validation";

const router = Router();
const adminController = new AdminController();

router.get("/orders", authenticateToken, authorizeRole([UserRole.ADMIN]), adminController.getAllOrders.bind(adminController));
router.get("/orders/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(idParamSchema), adminController.getOrderById.bind(adminController));
router.put("/orders/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(updateOrderSchema), adminController.updateOrder.bind(adminController));
router.get("/drivers", authenticateToken, authorizeRole([UserRole.ADMIN]), adminController.getAllDrivers.bind(adminController));
router.get("/stats", authenticateToken, authorizeRole([UserRole.ADMIN]), adminController.getDashboardStats.bind(adminController));
router.get("/users", authenticateToken, authorizeRole([UserRole.ADMIN]), adminController.getAllUsers.bind(adminController));
router.post("/users", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(createUserSchema), adminController.createUser.bind(adminController));
router.put("/users/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(updateUserSchema), adminController.updateUser.bind(adminController));
router.delete("/users/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(idParamSchema), adminController.deleteUser.bind(adminController));
router.put("/drivers/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(updateDriverSchema), adminController.updateDriver.bind(adminController));
router.delete("/drivers/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(idParamSchema), adminController.deleteDriver.bind(adminController));
router.post("/orders", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(createOrderSchema), adminController.createOrder.bind(adminController));

// Dynamic no-mock endpoints
router.get("/payments", authenticateToken, authorizeRole([UserRole.ADMIN]), adminController.getPayments.bind(adminController));
router.get("/analytics", authenticateToken, authorizeRole([UserRole.ADMIN]), adminController.getAnalytics.bind(adminController));
router.get("/multistop", authenticateToken, authorizeRole([UserRole.ADMIN]), adminController.getMultiStop.bind(adminController));
router.get("/tickets", authenticateToken, authorizeRole([UserRole.ADMIN, UserRole.SUPPORT]), adminController.getSupportTickets.bind(adminController));
router.post("/tickets", authenticateToken, authorizeRole([UserRole.ADMIN, UserRole.SUPPORT]), validateRequest(createSupportTicketSchema), adminController.createSupportTicket.bind(adminController));
router.put("/tickets/:id", authenticateToken, authorizeRole([UserRole.ADMIN, UserRole.SUPPORT]), validateRequest(updateSupportTicketSchema), adminController.updateSupportTicket.bind(adminController));

// Support team accounts — admin only; support staff cannot manage each other.
router.get("/support-members", authenticateToken, authorizeRole([UserRole.ADMIN]), adminController.getSupportMembers.bind(adminController));
router.post("/support-members", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(createSupportMemberSchema), adminController.createSupportMember.bind(adminController));
router.put("/support-members/:id/password", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(resetSupportMemberPasswordSchema), adminController.resetSupportMemberPassword.bind(adminController));
router.delete("/support-members/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(idParamSchema), adminController.deleteSupportMember.bind(adminController));

// Settings and Coupons routes
router.get("/config", authenticateToken, authorizeRole([UserRole.ADMIN]), adminController.getSystemConfig.bind(adminController));
router.put("/config", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(updateSystemConfigSchema), adminController.updateSystemConfig.bind(adminController));
router.get("/coupons", authenticateToken, authorizeRole([UserRole.ADMIN]), adminController.getCoupons.bind(adminController));
router.post("/coupons", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(createCouponSchema), adminController.createCoupon.bind(adminController));
router.put("/coupons/:id/toggle", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(idParamSchema), adminController.toggleCouponStatus.bind(adminController));
router.delete("/coupons/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(idParamSchema), adminController.deleteCoupon.bind(adminController));

// Dev Drivers seeding and control routes
router.post("/dev-drivers/seed", authenticateToken, authorizeRole([UserRole.ADMIN]), adminController.seedDevDrivers.bind(adminController));
router.get("/dev-drivers", authenticateToken, authorizeRole([UserRole.ADMIN]), adminController.getDevDrivers.bind(adminController));
router.put("/dev-drivers/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(updateDevDriverSchema), adminController.updateDevDriver.bind(adminController));
router.delete("/dev-drivers", authenticateToken, authorizeRole([UserRole.ADMIN]), adminController.deleteDevDrivers.bind(adminController));
// Banners management routes
router.get("/banners", authenticateToken, authorizeRole([UserRole.ADMIN]), adminController.getBanners.bind(adminController));
router.post("/banners", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(createBannerSchema), adminController.createBanner.bind(adminController));
router.put("/banners/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(updateBannerSchema), adminController.updateBanner.bind(adminController));
router.delete("/banners/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(idParamSchema), adminController.deleteBanner.bind(adminController));
// Offers management routes (customer app Offers page)
router.get("/offers", authenticateToken, authorizeRole([UserRole.ADMIN]), adminController.getOffers.bind(adminController));
router.post("/offers", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(createOfferSchema), adminController.createOffer.bind(adminController));
router.put("/offers/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(updateOfferSchema), adminController.updateOffer.bind(adminController));
router.delete("/offers/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(idParamSchema), adminController.deleteOffer.bind(adminController));

// User and Driver details routes
router.get("/users/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(idParamSchema), adminController.getUserDetail.bind(adminController));
router.get("/drivers/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(idParamSchema), adminController.getDriverDetail.bind(adminController));
router.get("/orders/:orderId/chat", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(orderIdParamSchema), adminController.getOrderChat.bind(adminController));
router.get("/app-versions", authenticateToken, authorizeRole([UserRole.ADMIN]), adminController.getAppVersions.bind(adminController));
router.put("/app-versions", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(updateAppVersionSchema), adminController.updateAppVersion.bind(adminController));

export default router;
