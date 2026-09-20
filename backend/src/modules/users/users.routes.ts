import { Router } from "express";
import { UsersController } from "./users.controller";
import { authenticateToken } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/upload.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import {
  updateProfileSchema,
  addAddressSchema,
  updateAddressSchema,
  addressIdParamSchema,
  changePasswordSchema,
  saveBookingPreferenceSchema,
  toggleFavoriteSchema,
  toggleFavoriteItemSchema,
  updatePushTokenSchema,
} from "./users.validation";

const router = Router();
const usersController = new UsersController();

router.get("/profile", authenticateToken, usersController.getProfile.bind(usersController));
router.patch("/profile", authenticateToken, validateRequest(updateProfileSchema), usersController.updateProfile.bind(usersController));
router.post("/profile-pic", authenticateToken, upload.single("image"), usersController.uploadProfilePic.bind(usersController));
router.delete("/profile-pic", authenticateToken, usersController.deleteProfilePic.bind(usersController));

router.post("/change-password", authenticateToken, validateRequest(changePasswordSchema), usersController.changePassword.bind(usersController));

router.get("/addresses", authenticateToken, usersController.getAddresses.bind(usersController));
router.post("/addresses", authenticateToken, validateRequest(addAddressSchema), usersController.addAddress.bind(usersController));
router.patch("/addresses/:id", authenticateToken, validateRequest(updateAddressSchema), usersController.updateAddress.bind(usersController));
router.delete("/addresses/:id", authenticateToken, validateRequest(addressIdParamSchema), usersController.deleteAddress.bind(usersController));

router.get("/recent-locations", authenticateToken, usersController.getRecentLocations.bind(usersController));

router.patch("/booking-preference", authenticateToken, validateRequest(saveBookingPreferenceSchema), usersController.saveBookingPreference.bind(usersController));

router.get("/favorites", authenticateToken, usersController.getFavorites.bind(usersController));
router.post("/favorites/:vendorId", authenticateToken, validateRequest(toggleFavoriteSchema), usersController.toggleFavorite.bind(usersController));

router.get("/favorite-items", authenticateToken, usersController.getFavoriteItems.bind(usersController));
router.post("/favorite-items/:itemId", authenticateToken, validateRequest(toggleFavoriteItemSchema), usersController.toggleFavoriteItem.bind(usersController));

router.post("/push-token", authenticateToken, validateRequest(updatePushTokenSchema), usersController.updatePushToken.bind(usersController));

export default router;

