import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";
import { showAlert } from "@/components/ui/AppAlert";
import { useToast } from "@/components/ui/Toast";
import type { OutletLocation } from "@/types/models";

/** "Plot 12, Road No. 3, Banjara Hills, Hyderabad, Telangana 500034" from a reverse-geocode result. */
function addressOf(place: Location.LocationGeocodedAddress | undefined): string | undefined {
  if (!place) return undefined;
  if (place.formattedAddress) return place.formattedAddress;
  const parts = [place.name, place.street, place.district, place.city ?? place.subregion, place.region, place.postalCode];
  const unique = parts.filter((p, i): p is string => !!p && parts.indexOf(p) === i);
  return unique.length ? unique.join(", ") : undefined;
}

/**
 * "Use my current location": asks for foreground location access, reads the
 * position and turns it into an address. The address is best effort — a
 * position without one is still saved.
 */
export function useCurrentLocation() {
  const { t } = useTranslation();
  const toast = useToast();
  const [locating, setLocating] = useState(false);

  const capture = async (): Promise<OutletLocation | null> => {
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        showAlert(t("editProfile.locationPermissionTitle"), t("editProfile.locationPermission"), undefined, "warning");
        return null;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = position.coords;
      const places = await Location.reverseGeocodeAsync({ latitude, longitude }).catch(() => []);
      return { lat: latitude, lng: longitude, address: addressOf(places[0]) };
    } catch {
      toast.show(t("editProfile.locationFailed"), "error");
      return null;
    } finally {
      setLocating(false);
    }
  };

  return { locating, capture };
}
