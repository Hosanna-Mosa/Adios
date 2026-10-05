import { Router } from "express";
import { authenticateToken, authorizeRole } from "../../middleware/auth.middleware";
import { UserRole } from "../../database/models/User";
import { validateRequest } from "../../middleware/validation.middleware";
import { verificationController as controller } from "./verification.controller";
import {
  approveSchema,
  listDriverVerificationsSchema,
  listVendorVerificationsSchema,
  rejectSchema,
  requestDriverDocumentsSchema,
  requestVendorDocumentsSchema,
} from "./verification.validation";

/**
 * Admin verification queue — /api/v1/admin/verifications
 *
 *   GET  /drivers                          list (?status=pending_approval|…|all)
 *   POST /drivers/:id/approve              allow the driver to go online
 *   POST /drivers/:id/reject               { reason? }
 *   POST /drivers/:id/request-documents    { documents[], note? }
 *   GET  /vendors                          list (?status=submitted|…|all)
 *   POST /vendors/:id/approve              allow vendor-portal sign-in
 *   POST /vendors/:id/reject               { reason? }
 *   POST /vendors/:id/request-documents    { documents[], note? }
 */
const router = Router();

router.use(authenticateToken, authorizeRole([UserRole.ADMIN]));

router.get("/drivers", validateRequest(listDriverVerificationsSchema), controller.listDrivers.bind(controller));
router.post("/drivers/:id/approve", validateRequest(approveSchema), controller.approveDriver.bind(controller));
router.post("/drivers/:id/reject", validateRequest(rejectSchema), controller.rejectDriver.bind(controller));
router.post(
  "/drivers/:id/request-documents",
  validateRequest(requestDriverDocumentsSchema),
  controller.requestDriverDocuments.bind(controller)
);

router.get("/vendors", validateRequest(listVendorVerificationsSchema), controller.listVendors.bind(controller));
router.post("/vendors/:id/approve", validateRequest(approveSchema), controller.approveVendor.bind(controller));
router.post("/vendors/:id/reject", validateRequest(rejectSchema), controller.rejectVendor.bind(controller));
router.post(
  "/vendors/:id/request-documents",
  validateRequest(requestVendorDocumentsSchema),
  controller.requestVendorDocuments.bind(controller)
);

export default router;
