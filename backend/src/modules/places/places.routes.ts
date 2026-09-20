import { Router } from "express";
import { PlacesController } from "./places.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import { nearbyPlacesSchema, autocompleteSchema, placeDetailsSchema, reverseGeocodeSchema } from "./places.validation";

const router = Router();

router.get("/nearby", validateRequest(nearbyPlacesSchema), PlacesController.getNearbyPlaces);
router.get("/autocomplete", validateRequest(autocompleteSchema), PlacesController.getAutocompleteSuggestions);
router.get("/details/:placeId", validateRequest(placeDetailsSchema), PlacesController.getPlaceDetails);

router.get("/reverse-geocode", validateRequest(reverseGeocodeSchema), PlacesController.reverseGeocode);

export default router;

