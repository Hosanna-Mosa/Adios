import * as Location from "expo-location";
import { Alert } from "react-native";
import { router } from "expo-router";
import i18n from "@/i18n";
import { checkZone } from "@/services/places.service";

// Split out of useLocationSelection so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useLocationSelectionSelectSavedAddress(params: any, serviceId: any, name: any, pickup: any, setPickup: any, drop: any, stops: any, bookingFor: any, someoneContact: any, setFetchingLocation: any, pickupRef: any, dropRef: any, handleSelection: any) {
  const selectSavedAddress = (addr: any) => {
    const lat = addr.coordinates?.lat ?? addr.location?.coordinates?.[1];
    const lng = addr.coordinates?.lng ?? addr.location?.coordinates?.[0];
    if (lat == null || lng == null) return;
    const data = { id: addr._id, name: addr.label, description: addr.addressLine, lat, lng };
    if (!pickup) {
      pickupRef.current?.setAddressText(addr.addressLine);
      handleSelection('pickup', data, null);
    } else {
      dropRef.current?.setAddressText(addr.addressLine);
      handleSelection('drop', data, null);
    }
  };

  const handleCurrentLocation = async () => {
    try {
      setFetchingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(i18n.t("app.ride.permissionDenied"), i18n.t("app.delivery.locationPermissionIsRequired"));
        setFetchingLocation(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

      // Check zone for current location
      try {
        const checkRes = await checkZone(location.coords.latitude, location.coords.longitude);
        if (!checkRes || !checkRes.inZone) {
          Alert.alert(i18n.t("app.delivery.noService"), i18n.t("app.ride.noServiceAtCurrentPickupLocation"));
          pickupRef.current?.setAddressText("");
          setPickup(null);
          return;
        }
      } catch (err) {
        console.error("Zone check failed:", err);
      }

      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const addr = geocode[0];
        const displayAddr = `${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}`.trim();
        pickupRef.current?.setAddressText(displayAddr);
        const newPickup = {
          name: displayAddr,
          lat: location.coords.latitude,
          lng: location.coords.longitude
        };
        setPickup(newPickup);

        if (drop) {
          router.push({
            pathname: "/ride-confirmation",
            params: {
              serviceId,
              pickupName: displayAddr,
              dropName: drop.name,
              pickupLat: newPickup.lat.toString(),
              pickupLng: newPickup.lng.toString(),
              dropLat: drop.lat.toString(),
              dropLng: drop.lng.toString(),
              stops: JSON.stringify(stops),
              bookingForType: bookingFor,
              riderContact: someoneContact,
            }
          });
        }
      }
    } catch (error) {
      Alert.alert(i18n.t("app.profile.errorTitle"), i18n.t("app.delivery.couldNotGetCurrentLocation"));
    } finally {
      setFetchingLocation(false);
    }
  };

  return { selectSavedAddress, handleCurrentLocation };
}
