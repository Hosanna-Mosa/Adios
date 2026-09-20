import { useEffect } from "react";
import * as Location from "expo-location";

// Part 2 of useAddAddress, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useAddAddressLngLabel(params: any, mapRef: any, isEditMode: any, setSelectedChip: any, setLabel: any, setAddressLine: any, setCompleteAddress: any, setInstructions: any, setShortAddress: any, setCityOrCountry: any, setLoading: any, region: any, setRegion: any, setIsResolvingAddress: any) {
  const lngLabel = region.longitude.toFixed(6);

  const fetchAddressForCoords = async (lat: number, lng: number) => {
    try {
      setIsResolvingAddress(true);
      const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (place) {
        const fullAddress = [place.name, place.streetNumber, place.street, place.city, place.region].filter(Boolean).join(", ");
        setAddressLine(fullAddress);
        setShortAddress(place.name || place.street || place.city || "Selected location");
        setCityOrCountry([place.city, place.region].filter(Boolean).join(", ") || "India");
      }
    } catch (error) {
      console.log("Reverse geocode failed", error);
    } finally {
      setIsResolvingAddress(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      const newRegion = { latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      await fetchAddressForCoords(latitude, longitude);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.lat && params.lng) {
      const pLat = Number(params.lat);
      const pLng = Number(params.lng);
      if (!isNaN(pLat) && !isNaN(pLng)) {
        setRegion({ latitude: pLat, longitude: pLng, latitudeDelta: 0.005, longitudeDelta: 0.005 });
      }
    }

    if (isEditMode) {
      const lbl = String(params.label || "");
      if (lbl === "Home" || lbl === "Work") {
        setSelectedChip(lbl);
      } else {
        setSelectedChip("Other");
        setLabel(lbl);
      }

      const fullAddr = String(params.addressLine || "");
      const matchInst = fullAddr.match(/\(Instructions: (.*?)\)/);
      if (matchInst) setInstructions(matchInst[1]);
      const cleanedFromInst = fullAddr.replace(/\s*\(Instructions:.*?\)/, "").trim();

      const matchApt = cleanedFromInst.match(/\[Apt: (.*?)\]/);
      if (matchApt) {
        setCompleteAddress(matchApt[1]);
        setAddressLine(cleanedFromInst.replace(/\s*\[Apt:.*?\]/, "").trim());
      } else {
        const commaIndex = cleanedFromInst.indexOf(",");
        if (commaIndex !== -1 && commaIndex < 15) {
          setCompleteAddress(cleanedFromInst.substring(0, commaIndex).trim());
          setAddressLine(cleanedFromInst.substring(commaIndex + 1).trim());
        } else {
          setAddressLine(cleanedFromInst);
        }
      }
    } else if (!params.lat) {
      handleUseCurrentLocation();
    }
  }, []);

  return { lngLabel, fetchAddressForCoords, handleUseCurrentLocation };
}
