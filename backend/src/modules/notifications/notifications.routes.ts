import { Router } from "express";
import { NotificationsController } from "./notifications.controller";
import { authenticateToken } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import {
  listNotificationsSchema,
  notificationIdParamSchema,
  webPushSubscribeSchema,
  webPushUnsubscribeSchema,
} from "./notifications.validation";

const router = Router();
const controller = new NotificationsController();

// All routes are authenticated
router.get("/", authenticateToken, validateRequest(listNotificationsSchema), controller.getNotifications.bind(controller));
router.get("/unread-count", authenticateToken, controller.getUnreadCount.bind(controller));
router.patch("/read-all", authenticateToken, controller.markAllAsRead.bind(controller));
router.patch("/:id/read", authenticateToken, validateRequest(notificationIdParamSchema), controller.markAsRead.bind(controller));
router.delete("/:id", authenticateToken, validateRequest(notificationIdParamSchema), controller.deleteNotification.bind(controller));

router.post("/trigger-commute", authenticateToken, controller.triggerCommute.bind(controller));
router.post("/check-abandoned", authenticateToken, controller.checkAbandoned.bind(controller));

// Browser Web Push (admin/support/vendor dashboard) — role-agnostic, keyed off whatever the
// JWT's userId resolves to (a User for admin/support, a Vendor for vendor logins).
router.post("/web-push/subscribe", authenticateToken, validateRequest(webPushSubscribeSchema), controller.webPushSubscribe.bind(controller));
router.post("/web-push/unsubscribe", authenticateToken, validateRequest(webPushUnsubscribeSchema), controller.webPushUnsubscribe.bind(controller));

export default router;
