import React from "react";
import { Alert } from "react-native";

import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import MapView, { PROVIDER_GOOGLE } from "@/components/maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { createStyles } from "@/features/ride/pickup-confirmation.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { customFetch } from "@/utils/api/custom-fetch";

import { PickupConfirmPanel } from "@/features/ride/components/PickupConfirmPanel";
import { PickupConfirmMapArea } from "@/features/ride/components/PickupConfirmMapArea";
import { ScreenShell } from "@/components/ui/ScreenShell";

type FareEstimate = {
  distanceInKm: number;
  estimatedMinutes: number;
  fareBreakdown: {
    total: number;
  };
};

const normalizeServiceType = (serviceId?: string) => {
  if (serviceId === "bike-lite") return "bike";
  // if (serviceId === "cab-prime") return "cab_prime";
  if (serviceId === "bike" || serviceId === "auto" || serviceId === "cab") {
    return serviceId;
  }
  return "cab";
};

const firstLine = (value?: string) => {
  if (!value) return "Pickup point";
  return value.split(",")[0]?.trim() || value;
};

const formatGeocodeAddress = (place: Location.LocationGeocodedAddress) => {
  const parts = [
    place.name,
    place.street,
    place.district,
    place.city,
    place.region,
    place.postalCode,
  ].filter(Boolean);

  return parts.join(", ") || "Current location";
};

export default function PickupConfirmationScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services.ride;
  const styles = React.useMemo(() => createStyles(tokens, accent, insets), [theme, insets]);
  const mapRef = React.useRef<MapView>(null);

  const params = useLocalSearchParams<{
    serviceId: string;
    rideId: string;
    rideName: string;
    ridePrice: string;
    pickupName: string;
    dropName: string;
    pickupLat: string;
    pickupLng: string;
    dropLat: string;
    dropLng: string;
    stops?: string;
    estimatedMinutes?: string;
    distanceInKm?: string;
    fareTotal?: string;
  }>();

  const pickupCoords = React.useMemo(
    () => ({
      latitude: parseFloat(params.pickupLat || "0"),
      longitude: parseFloat(params.pickupLng || "0"),
    }),
    [params.pickupLat, params.pickupLng],
  );
  const [confirmedPickup, setConfirmedPickup] = React.useState({
    name: params.pickupName || "Pickup point",
    coords: pickupCoords,
  });

  const [estimate, setEstimate] = React.useState<FareEstimate | null>(() => {
    const total = Number(params.fareTotal);
    const estimatedMinutes = Number(params.estimatedMinutes);
    const distanceInKm = Number(params.distanceInKm);
    if (!Number.isFinite(total) || !total) return null;
    return {
      distanceInKm: Number.isFinite(distanceInKm) ? distanceInKm : 0,
      estimatedMinutes: Number.isFinite(estimatedMinutes) ? estimatedMinutes : 0,
      fareBreakdown: { total },
    };
  });
  const [loadingEstimate, setLoadingEstimate] = React.useState(false);

  React.useEffect(() => {
    const canEstimate =
      Number.isFinite(confirmedPickup.coords.latitude) &&
      Number.isFinite(confirmedPickup.coords.longitude) &&
      Number.isFinite(Number(params.dropLat)) &&
      Number.isFinite(Number(params.dropLng));

    if (!canEstimate) return;

    const loadEstimate = async () => {
      setLoadingEstimate(true);
      try {
        const query = new URLSearchParams({
          pickupLat: String(confirmedPickup.coords.latitude),
          pickupLng: String(confirmedPickup.coords.longitude),
          dropLat: String(params.dropLat),
          dropLng: String(params.dropLng),
          serviceType: normalizeServiceType(params.serviceId),
        });
        const result = await customFetch<FareEstimate>(
          `/orders/estimate-fare?${query.toString()}`,
          { responseType: "json" },
        );
        setEstimate(result);
      } catch (error) {
        console.error("Pickup estimate error:", error);
      } finally {
        setLoadingEstimate(false);
      }
    };

    loadEstimate();
  }, [
    params.dropLat,
    params.dropLng,
    params.serviceId,
    confirmedPickup.coords.latitude,
    confirmedPickup.coords.longitude,
  ]);

  const recenter = () => {
    mapRef.current?.animateToRegion(
      {
        ...confirmedPickup.coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500,
    );
  };

  const updatePickup = () => {
    router.push({
      pathname: "/ride-searching",
      params: {
        serviceId: params.serviceId,
        rideId: params.rideId,
        rideName: params.rideName,
        ridePrice: estimate ? `₹${estimate.fareBreakdown.total.toFixed(2)}` : params.ridePrice,
        pickupName: confirmedPickup.name,
        pickupLat: confirmedPickup.coords.latitude.toString(),
        pickupLng: confirmedPickup.coords.longitude.toString(),
        dropName: params.dropName,
        dropLat: params.dropLat,
        dropLng: params.dropLng,
        fareTotal: estimate?.fareBreakdown.total.toString() || params.fareTotal,
        estimatedMinutes: estimate?.estimatedMinutes.toString() || params.estimatedMinutes,
        distanceInKm: estimate?.distanceInKm.toString() || params.distanceInKm,
        stops: params.stops,
      },
    });
  };

  const useCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      let locationName = "Current location";
      try {
        const places = await Location.reverseGeocodeAsync(coords);
        if (places[0]) {
          locationName = formatGeocodeAddress(places[0]);
        }
      } catch (error) {
        console.error("Current location reverse geocode error:", error);
      }

      setConfirmedPickup({
        name: locationName,
        coords,
      });

      mapRef.current?.animateToRegion(
        {
          ...coords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      );
    } catch {
      Alert.alert("Error", "Could not fetch current location.");
    }
  };

  return (
    <ScreenShell>
      <PickupConfirmMapArea
        MapView={MapView}
        PROVIDER_GOOGLE={PROVIDER_GOOGLE}
        pickupCoords={pickupCoords}
        accent={accent}
        insets={insets}
        mapRef={mapRef}
        styles={styles}
        tokens={tokens}
        useCurrentLocation={useCurrentLocation}
      />

      <PickupConfirmPanel
        firstLine={firstLine}
        confirmedPickup={confirmedPickup}
        estimate={estimate}
        loadingEstimate={loadingEstimate}
        params={params}
        recenter={recenter}
        styles={styles}
        tokens={tokens}
        updatePickup={updatePickup}
      />
    </ScreenShell>
  );
}
