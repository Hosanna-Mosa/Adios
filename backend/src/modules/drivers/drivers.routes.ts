import { Router } from "express";
import { DriversController } from "./drivers.controller";
import { authenticateToken, authorizeRole } from "../../middleware/auth.middleware";
import { UserRole } from "../../database/models/User";
import { validateRequest } from "../../middleware/validation.middleware";
import {
  updateStatusSchema,
  updateHomeModeSchema,
  updateLocationSchema,
  updateProfileSchema,
  cashOutSchema,
  nearbyDriversSchema,
  highDemandAreasSchema,
} from "./drivers.validation";

const router = Router();
const driversController = new DriversController();

router.patch("/status", authenticateToken, authorizeRole([UserRole.DRIVER]), validateRequest(updateStatusSchema), driversController.updateStatus.bind(driversController));
router.patch("/home-mode", authenticateToken, authorizeRole([UserRole.DRIVER]), validateRequest(updateHomeModeSchema), driversController.updateHomeMode.bind(driversController));
router.patch("/location", authenticateToken, authorizeRole([UserRole.DRIVER]), validateRequest(updateLocationSchema), driversController.updateLocation.bind(driversController));
router.get("/profile", authenticateToken, authorizeRole([UserRole.DRIVER]), driversController.profile.bind(driversController));
router.patch("/profile", authenticateToken, authorizeRole([UserRole.DRIVER]), validateRequest(updateProfileSchema), driversController.updateProfile.bind(driversController));
router.get("/earnings", authenticateToken, authorizeRole([UserRole.DRIVER]), driversController.earnings.bind(driversController));
router.post("/cash-out", authenticateToken, authorizeRole([UserRole.DRIVER]), validateRequest(cashOutSchema), driversController.cashOut.bind(driversController));
router.get("/high-demand-areas", authenticateToken, authorizeRole([UserRole.DRIVER]), validateRequest(highDemandAreasSchema), driversController.highDemandAreas.bind(driversController));
router.get("/nearby", authenticateToken, validateRequest(nearbyDriversSchema), driversController.nearby.bind(driversController));

export default router;
