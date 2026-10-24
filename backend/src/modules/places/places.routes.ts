import { Router } from "express";
import { PlacesController } from "./places.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import { optionalAuth } from "../../middleware/auth.middleware";
import { mapsRateLimiter } from "../../middleware/rateLimit.middleware";
import { nearbyPlacesSchema, autocompleteSchema, placeDetailsSchema, reverseGeocodeSchema } from "./places.validation";

const router = Router();

// Every route here is a billed Google Maps call.
router.use(optionalAuth, mapsRateLimiter);

router.get("/nearby", validateRequest(nearbyPlacesSchema), PlacesController.getNearbyPlaces);
router.get("/autocomplete", validateRequest(autocompleteSchema), PlacesController.getAutocompleteSuggestions);
router.get("/details/:placeId", validateRequest(placeDetailsSchema), PlacesController.getPlaceDetails);

router.get("/reverse-geocode", validateRequest(reverseGeocodeSchema), PlacesController.reverseGeocode);

export default router;

