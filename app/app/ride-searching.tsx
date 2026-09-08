import React from "react";
import {
  Alert,
  Dimensions,
  View,
} from "react-native";
import { interpolate, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

import { router, useLocalSearchParams } from "expo-router";
import MapView from "@/components/maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { SearchingMap } from "@/features/ride/components/SearchingMap";
import { SearchingPanel } from "@/features/ride/components/SearchingPanel";
import { BookAgainOverlay } from "@/features/ride/components/BookAgainOverlay";
import { createStyles } from "@/features/ride/ride-searching.styles";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useThemeStore } from "@/contexts/themeStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { socketService } from "@/utils/socketService";

const VEHICLE_BIKE_3D = require("@/assets/images/services/scooter_blue_top_view_2.png");
const VEHICLE_AUTO_3D = require("@/assets/images/services/auto_top_view.png");
const VEHICLE_CAB_3D = require("@/assets/images/services/cab.png");


const normalizeServiceType = (serviceId?: string) => {
  if (serviceId === "bike-lite") return "bike";
  // if (serviceId === "cab-prime") return "cab_prime";
  if (serviceId === "bike" || serviceId === "auto" || serviceId === "cab") {
    return serviceId;
  }
  return "cab";
};

const parseFare = (value?: string, fallback?: string) => {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return Math.round(numeric);

  const fromPrice = Number(String(fallback || "").replace(/[^\d.]/g, ""));
  if (Number.isFinite(fromPrice) && fromPrice > 0) return Math.round(fromPrice);

  return 25;
};

const CANCEL_REASONS = [
  "Selected Wrong Pickup Location",
  "Selected Wrong Drop Location",
  "Booked by mistake",
  "Selected different service/vehicle",
  "Taking too long to confirm the ride",
  "Got a ride elsewhere",
  "Others",
];

export default function RideSearchingScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  const styles = React.useMemo(() => createStyles(colors, insets), [colors, insets]);
  const { currentOrderId, setOrderId: setCurrentOrderId, setServiceType: setGlobalServiceType, setDriver: setGlobalDriver, setStatus: setGlobalStatus } = useDeliveryStore();
  const mapRef = React.useRef<MapView>(null);

  const animatedProgress = useSharedValue(0);
  const dotOpacity = useSharedValue(1);

  React.useEffect(() => {
    animatedProgress.value = withRepeat(withTiming(1, { duration: 2000 }), -1, false);
  }, [animatedProgress]);

  React.useEffect(() => {
    dotOpacity.value = withRepeat(withSequence(withTiming(0.3, { duration: 800 }), withTiming(1, { duration: 800 })), -1, false);
  }, [dotOpacity]);

  const screenWidth = Dimensions.get("window").width;
  const progressBarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(animatedProgress.value, [0, 1], [-120, screenWidth]) }],
  }));
  const dotStyle = useAnimatedStyle(() => ({ opacity: dotOpacity.value }));

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
    fareTotal?: string;
    estimatedMinutes?: string;
    distanceInKm?: string;
  }>();
  const [tripDetailsVisible, setTripDetailsVisible] = React.useState(false);
  const [cancelReasonVisible, setCancelReasonVisible] = React.useState(false);
  const [cancelConfirmVisible, setCancelConfirmVisible] = React.useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = React.useState("");

  interface OnlineDriver {
    _id: string;
    currentLocation?: {
      coordinates: [number, number];
    };
    vehicleType?: "bike" | "auto" | "car";
  }

  const [onlineDrivers, setOnlineDrivers] = React.useState<OnlineDriver[]>([]);

  const pickupCoords = React.useMemo(
    () => ({
      latitude: parseFloat(params.pickupLat || "0"),
      longitude: parseFloat(params.pickupLng || "0"),
    }),
    [params.pickupLat, params.pickupLng],
  );
  const dropCoords = React.useMemo(
    () => ({
      latitude: parseFloat(params.dropLat || "0"),
      longitude: parseFloat(params.dropLng || "0"),
    }),
    [params.dropLat, params.dropLng],
  );

  React.useEffect(() => {
    let active = true;
    const fetchOnlineDrivers = async () => {
      try {
        const service = normalizeServiceType(params.serviceId);
        console.log(`[CLIENT DRIVER SEARCH] Request coordinates: [lat: ${pickupCoords.latitude}, lng: ${pickupCoords.longitude}], vehicleType: ${service}`);
        const queryParams = new URLSearchParams({
          latitude: String(pickupCoords.latitude),
          longitude: String(pickupCoords.longitude),
          radius: "5000",
          vehicleType: service,
        });
        const res = await customFetch<OnlineDriver[]>(`/drivers/nearby?${queryParams.toString()}`);
        console.log(`[CLIENT DRIVER SEARCH RESPONSE] Returned count: ${res ? res.length : 0}, data: ${JSON.stringify(res)}`);
        if (active && Array.isArray(res)) {
          setOnlineDrivers(res);
        }
      } catch (error) {
        console.error("Failed to fetch nearby drivers:", error);
      }
    };

    fetchOnlineDrivers();
    const interval = setInterval(fetchOnlineDrivers, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [pickupCoords.latitude, pickupCoords.longitude, params.serviceId]);

  const fare = parseFare(params.fareTotal, params.ridePrice);
  const pickupTitle = String(params.pickupName || "Pickup").split(",")[0];
  const dropTitle = String(params.dropName || "Drop").split(",")[0];
  const cancelUsesDrop = selectedCancelReason.toLowerCase().includes("drop");
  const cancelLocationTitle = cancelUsesDrop ? dropTitle : pickupTitle;
  const cancelLocationAddress = cancelUsesDrop ? params.dropName : params.pickupName;
  const cancelLocationLabel = cancelUsesDrop ? "drop" : "pickup";

  const fitTripMarkers = React.useCallback(() => {
    const validCoords =
      Number.isFinite(pickupCoords.latitude) &&
      Number.isFinite(pickupCoords.longitude) &&
      Number.isFinite(dropCoords.latitude) &&
      Number.isFinite(dropCoords.longitude);

    if (!validCoords) return;

    mapRef.current?.fitToCoordinates([pickupCoords, dropCoords], {
      edgePadding: { top: 48, right: 90, bottom: 56, left: 90 },
      animated: false,
    });
  }, [dropCoords, pickupCoords]);

  React.useEffect(() => {
    const timer = setTimeout(fitTripMarkers, 250);
    return () => clearTimeout(timer);
  }, [fitTripMarkers]);

  React.useEffect(() => {
    const createRideOrder = async () => {
      try {
        const order = await customFetch<any>("/orders", {
          method: "POST",
          responseType: "json",
          body: JSON.stringify({
            serviceType: normalizeServiceType(params.serviceId),
            stops: [
              {
                address: params.pickupName,
                latitude: pickupCoords.latitude,
                longitude: pickupCoords.longitude,
                type: "pickup",
              },
              {
                address: params.dropName,
                latitude: dropCoords.latitude,
                longitude: dropCoords.longitude,
                type: "drop",
              },
            ],
          }),
        });

        const id = order?._id || order?.id;
        if (id) {
          setCurrentOrderId(id);
          setGlobalServiceType(normalizeServiceType(params.serviceId));
        }
      } catch (error: any) {
        console.error("Create ride order error:", error);
        Alert.alert("Ride request", error?.message || "Could not request this ride.");
      }
    };

    createRideOrder();
  }, [
    dropCoords.latitude,
    dropCoords.longitude,
    params.dropName,
    params.pickupName,
    params.serviceId,
    pickupCoords.latitude,
    pickupCoords.longitude,
    setCurrentOrderId,
    setGlobalServiceType,
  ]);

  React.useEffect(() => {
    if (currentOrderId) {
      socketService.connect();
      socketService.trackOrder(currentOrderId);

      const handleOrderAccepted = (data: any) => {
        if (data.orderId === currentOrderId) {
          setGlobalDriver(data.driver);
          setGlobalStatus("driver_assigned");
          
          Alert.alert("Driver Assigned", `${data.driver.name} is on the way!`, [
            {
              text: "OK",
              onPress: () => {
                router.push("/tracking");
              }
            }
          ]);
        }
      };

      socketService.on("order_accepted", handleOrderAccepted);
      return () => {
        socketService.off("order_accepted", handleOrderAccepted);
      };
    }
  }, [currentOrderId]);

  const showTripDetails = () => {
    setCancelConfirmVisible(false);
    setCancelReasonVisible(false);
    setTripDetailsVisible(true);
  };
  const showCancelReasons = () => {
    setCancelConfirmVisible(false);
    setCancelReasonVisible(true);
  };
  const selectCancelReason = (reason: string) => {
    setSelectedCancelReason(reason);
    setCancelReasonVisible(false);
    setCancelConfirmVisible(true);
  };
  const keepSearching = () => {
    setCancelConfirmVisible(false);
    setCancelReasonVisible(false);
  };
  const cancelRide = async () => {
    const orderIdToCancel = currentOrderId;
    setCancelConfirmVisible(false);
    setCancelReasonVisible(false);
    setTripDetailsVisible(false);
    setCurrentOrderId(null);
    router.push("/(tabs)");

    if (orderIdToCancel) {
      try {
        await customFetch(`/orders/${orderIdToCancel}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "CANCELLED" }),
        });
      } catch (error) {
        console.error("Failed to cancel order on backend:", error);
      }
    }
  };
  /* void [
      `${params.pickupName}\n\nTo\n\n${params.dropName}\n\nRide: ${params.rideName || "Bike Ride"}\nFare: ₹${fare}`,

  ]; */

  return (
    <View style={styles.root}>
      <SearchingMap
        VEHICLE_AUTO_3D={VEHICLE_AUTO_3D}
        VEHICLE_BIKE_3D={VEHICLE_BIKE_3D}
        VEHICLE_CAB_3D={VEHICLE_CAB_3D}
        colors={colors}
        dropCoords={dropCoords}
        fitTripMarkers={fitTripMarkers}
        mapRef={mapRef}
        onlineDrivers={onlineDrivers}
        pickupCoords={pickupCoords}
        styles={styles}
      />

      <SearchingPanel
        colors={colors}
        dotStyle={dotStyle}
        fare={fare}
        progressBarStyle={progressBarStyle}
        showTripDetails={showTripDetails}
        styles={styles}
      />

      {tripDetailsVisible && (
        <BookAgainOverlay
          CANCEL_REASONS={CANCEL_REASONS}
          cancelConfirmVisible={cancelConfirmVisible}
          cancelLocationAddress={cancelLocationAddress}
          cancelLocationLabel={cancelLocationLabel}
          cancelLocationTitle={cancelLocationTitle}
          cancelReasonVisible={cancelReasonVisible}
          cancelRide={cancelRide}
          cancelUsesDrop={cancelUsesDrop}
          colors={colors}
          dropTitle={dropTitle}
          fare={fare}
          keepSearching={keepSearching}
          params={params}
          pickupTitle={pickupTitle}
          selectCancelReason={selectCancelReason}
          selectedCancelReason={selectedCancelReason}
          setCancelReasonVisible={setCancelReasonVisible}
          setTripDetailsVisible={setTripDetailsVisible}
          showCancelReasons={showCancelReasons}
          styles={styles}
        />
      )}
    </View>
  );
}
