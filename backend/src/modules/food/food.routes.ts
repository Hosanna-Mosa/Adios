import { Router } from "express";
import multer from "multer";
import { authenticateToken, authorizeRole } from "../../middleware/auth.middleware";
import { UserRole } from "../../database/models/User";
import {
  getVendorMenu, 
  addFoodItem, 
  updateFoodItem, 
  deleteFoodItem,
  uploadImages,
  searchFoodItems,
  getStore149Items
} from "./food.controller";
import {
  extractMenuFromImage,
  saveRestaurantAndMenu,
  getRestaurants,
  getRestaurantAndMenu,
  updateRestaurantAndMenu,
  deleteRestaurant
} from "./restaurant-menu.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import {
  vendorIdParamSchema,
  foodItemIdParamSchema,
  addFoodItemSchema,
  updateFoodItemSchema,
  searchFoodItemsSchema,
  store149ItemsSchema,
  saveRestaurantAndMenuSchema,
  restaurantIdParamSchema,
  updateRestaurantAndMenuSchema,
} from "./food.validation";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/search", validateRequest(searchFoodItemsSchema), searchFoodItems);
router.get("/store-149", validateRequest(store149ItemsSchema), getStore149Items);
router.get("/vendor/:vendorId", validateRequest(vendorIdParamSchema), getVendorMenu);
router.post("/", authenticateToken, validateRequest(addFoodItemSchema), addFoodItem);
router.post("/upload", authenticateToken, upload.array("images", 5), uploadImages);
router.put("/:id", authenticateToken, validateRequest(updateFoodItemSchema), updateFoodItem);
router.delete("/:id", authenticateToken, validateRequest(foodItemIdParamSchema), deleteFoodItem);

// Restaurant Menu Routes — admin-curated digital menu QR feature (DigitalMenuRestaurant has
// no vendor-owner field; only reachable via the admin dashboard's RestaurantMenu.tsx page).
router.post("/restaurant-menu/extract", authenticateToken, authorizeRole([UserRole.ADMIN]), upload.array("images", 5), extractMenuFromImage);
router.post("/restaurant-menu/save", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(saveRestaurantAndMenuSchema), saveRestaurantAndMenu);
router.get("/restaurant-menu/restaurants", authenticateToken, authorizeRole([UserRole.ADMIN]), getRestaurants);
router.get("/restaurant-menu/restaurants/:id", validateRequest(restaurantIdParamSchema), getRestaurantAndMenu);
router.put("/restaurant-menu/restaurants/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(updateRestaurantAndMenuSchema), updateRestaurantAndMenu);
router.delete("/restaurant-menu/restaurants/:id", authenticateToken, authorizeRole([UserRole.ADMIN]), validateRequest(restaurantIdParamSchema), deleteRestaurant);

export default router;

