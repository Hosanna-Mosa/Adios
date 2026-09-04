import { Router } from "express";
import { createZone, getZones, getZoneById, updateZone, deleteZone, checkCoordinates } from "./zones.controller";
import { authenticateToken, authorizeRole } from "../../middleware/auth.middleware";
import { UserRole } from "../../database/models/User";
import { validateRequest } from "../../middleware/validation.middleware";
import { createZoneSchema, updateZoneSchema, zoneIdParamSchema, checkCoordinatesSchema } from "./zones.validation";

const router = Router();

// Public / client-facing endpoint to check if coordinate falls in a zone
router.get("/check", validateRequest(checkCoordinatesSchema), checkCoordinates);

// View zones
router.get("/", authenticateToken, getZones);
router.get("/:id", authenticateToken, validateRequest(zoneIdParamSchema), getZoneById);

// Admin-only operations to manage zones
router.post("/", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(createZoneSchema), createZone);
router.put("/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(updateZoneSchema), updateZone);
router.delete("/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(zoneIdParamSchema), deleteZone);

export default router;
