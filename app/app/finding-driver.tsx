import React, { useEffect, useState, useMemo } from "react";
import { CancelRideSheet } from "@/features/ride/components/CancelRideSheet";
import { View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { FindingDriverSheet } from "@/features/ride/components/FindingDriverSheet";
import { createStyles } from "@/features/ride/finding-driver.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { socketService } from "@/utils/socketService";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { MapBackground } from "@/components/MapBackground";
import { FindingDriverRadarWrap } from "@/features/ride/components/FindingDriverRadarWrap";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { FindingDriverBody } from "@/features/ride/components/FindingDriverBody";

const TIER_LABEL: Record<string, string> = {
  bike: "Bike",
  auto: "Auto",
  cab: "Cab Economy",
  cab_prime: "Cab Prime",
};

const CANCEL_REASONS = ["Waiting too long", "Booked by mistake", "Fare is too high", "Found another ride", "Other"];

export default function FindingDriverScreen() {
  const insets = useSafeAreaInsets();
  const { orderId, isReserved, dateTimeStr } = useLocalSearchParams<{ orderId: string; isReserved?: string; dateTimeStr?: string }>();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services.ride;
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedDriver, setConfirmedDriver] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [onlineDrivers, setOnlineDrivers] = useState<any[]>([]);
  const [orderSummary, setOrderSummary] = useState<{ totalPrice?: number; totalDistance?: number; duration?: number; serviceType?: string }>({});

  const sweep = useSharedValue(0);
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);

  useEffect(() => {
    sweep.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.linear }), -1, false);
    // Each ring loops its own [pause, pulse] cycle — ring2's 800ms pause
    // before every pulse is what staggers it relative to ring1.
    ring1.value = withRepeat(withTiming(1, { duration: 2600 }), -1, false);
    ring2.value = withRepeat(withSequence(withTiming(0, { duration: 800 }), withTiming(1, { duration: 2600 })), -1, false);
  }, [sweep, ring1, ring2]);

  const ring1Style = useAnimatedStyle(() => ({
    opacity: interpolate(ring1.value, [0, 1], [0.18, 0]),
    transform: [{ scale: interpolate(ring1.value, [0, 1], [0.3, 1]) }],
  }));
  const ring2Style = useAnimatedStyle(() => ({
    opacity: interpolate(ring2.value, [0, 1], [0.22, 0]),
    transform: [{ scale: interpolate(ring2.value, [0, 1], [0.3, 1]) }],
  }));
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sweep.value * 360}deg` }],
  }));

  useEffect(() => {
    if (!orderId) {
      router.push("/(tabs)");
      return;
    }

    const isReservedVal = isReserved === "true";
    useDeliveryStore.getState().setOrderId(orderId);

    socketService.connect();
    socketService.trackOrder(orderId);

    let pollIntervalId: any;
    let isTransitioned = false;

    const handleTransition = (driverData: any) => {
      if (isTransitioned) return;
      isTransitioned = true;

      if (pollIntervalId) clearInterval(pollIntervalId);
      if (timeoutTimer) clearTimeout(timeoutTimer);

      const { setDriver, setStatus } = useDeliveryStore.getState();

      const driverInfo = driverData
        ? typeof driverData === "object"
          ? {
              id: driverData.id || driverData._id || "unknown",
              name: driverData.name || driverData.user?.name || "Driver",
              phone: driverData.phone || driverData.user?.phone || "",
              vehicle: driverData.vehicle || driverData.vehicleType || "unknown",
            }
          : { id: driverData, name: "Driver", phone: "", vehicle: "unknown" }
        : { id: "unknown", name: "Driver", phone: "", vehicle: "unknown" };

      setDriver(driverInfo);
      setStatus("driver_assigned");

      if (isReservedVal) {
        setConfirmedDriver(driverInfo);
        setBookingConfirmed(true);
      } else {
        router.push({ pathname: "/tracking", params: { orderId } });
      }
    };

    const handleOrderCancelled = () => {
      if (isTransitioned) return;
      isTransitioned = true;
      if (pollIntervalId) clearInterval(pollIntervalId);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      router.replace("/(tabs)");
      setTimeout(() => {
        Alert.alert("Order cancelled", "Driver is unavailable.", [{ text: "OK", onPress: () => {} }], { cancelable: true });
      }, 500);
    };

    const checkOrderStatus = async () => {
      if (isTransitioned) return;
      try {
        const orderData = await customFetch<any>(`/orders/${orderId}`, { responseType: "json" });
        if (orderData) {
          if (orderData.serviceType) useDeliveryStore.getState().setServiceType(orderData.serviceType);
          setOrderSummary({
            totalPrice: orderData.totalPrice,
            totalDistance: orderData.totalDistance,
            duration: orderData.duration,
            serviceType: orderData.serviceType,
          });
          if (orderData.stops && orderData.stops.length > 0) {
            const mappedStops = orderData.stops.map((s: any) => ({
              id: s._id,
              address: s.address,
              lat: s.location.coordinates[1],
              lng: s.location.coordinates[0],
              type: s.type,
              items: s.items?.lines || [],
            }));
            setStops((prev) => {
              if (prev && prev.length === mappedStops.length && prev.every((v, i) => v.id === mappedStops[i].id)) return prev;
              return mappedStops;
            });
          }
          if (orderData.status && orderData.status.toUpperCase() === "CANCELLED") {
            handleOrderCancelled();
            return;
          }
          if (orderData.status && orderData.status.toUpperCase() === "DRIVER_ASSIGNED") {
            handleTransition(orderData.driver);
          }
        }
      } catch (err) {
        console.error("Error checking order status:", err);
      }
    };

    checkOrderStatus();
    pollIntervalId = setInterval(checkOrderStatus, 2000);

    const handleOrderAccepted = (data: any) => {
      if (data && String(data.orderId) === String(orderId)) handleTransition(data.driver);
    };
    const handleStatusUpdate = (data: any) => {
      if (data && String(data.orderId) === String(orderId) && data.status?.toUpperCase() === "CANCELLED") handleOrderCancelled();
    };

    socketService.on("order_accepted", handleOrderAccepted);
    socketService.on("order_status_update", handleStatusUpdate);

    let timeoutTimer: any;
    if (isReservedVal) {
      timeoutTimer = setTimeout(async () => {
        if (isTransitioned) return;
        isTransitioned = true;
        if (pollIntervalId) clearInterval(pollIntervalId);
        Alert.alert(
          "No captain found",
          "Sorry, no captains are available to accept your reservation request right now. Please try scheduling again later.",
          [{
            text: "OK",
            onPress: async () => {
              router.replace("/(tabs)");
              if (orderId) {
                try {
                  await customFetch(`/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status: "CANCELLED" }) });
                } catch (error) {
                  console.error("Failed to cancel order on backend:", error);
                }
              }
            },
          }]
        );
      }, 60000);
    }

    return () => {
      socketService.off("order_accepted", handleOrderAccepted);
      socketService.off("order_status_update", handleStatusUpdate);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (pollIntervalId) clearInterval(pollIntervalId);
    };
  }, [orderId, isReserved, dateTimeStr]);

  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);

  const handleCancel = async () => {
    setShowCancelSheet(false);
    router.push("/(tabs)");
    if (orderId) {
      try {
        await customFetch(`/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status: "CANCELLED" }) });
      } catch (error) {
        console.error("Failed to cancel order on backend:", error);
      }
    }
  };

  useEffect(() => {
    if (!stops || stops.length === 0) return;
    const pickupStop = stops.find((s) => s.type === "pickup") || stops[0];
    if (!pickupStop?.lat || !pickupStop?.lng) return;

    let active = true;
    const fetchOnlineDrivers = async () => {
      try {
        const queryParams = new URLSearchParams({ latitude: String(pickupStop.lat), longitude: String(pickupStop.lng), radius: "50000" });
        const res = await customFetch<any[]>(`/drivers/nearby?${queryParams.toString()}`);
        if (active && Array.isArray(res)) {
          const mapped = res
            .map((drv) => ({
              id: drv._id,
              lat: drv.currentLocation?.coordinates?.[1] || drv.user?.addresses?.[0]?.location?.coordinates?.[1] || pickupStop.lat,
              lng: drv.currentLocation?.coordinates?.[0] || drv.user?.addresses?.[0]?.location?.coordinates?.[0] || pickupStop.lng,
              vehicleType: drv.vehicleType || "bike",
              name: drv.user?.name || "Driver",
            }))
            .filter((d) => d.lat && d.lng);
          setOnlineDrivers(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch nearby drivers in finding-driver:", error);
      }
    };

    fetchOnlineDrivers();
    const interval = setInterval(fetchOnlineDrivers, 10000);
    return () => { active = false; clearInterval(interval); };
  }, [stops]);

  const pickupStop = stops.find((s) => s.type === "pickup");
  const dropStop = stops.find((s) => s.type === "drop");
  const tierLabel = orderSummary.serviceType ? TIER_LABEL[orderSummary.serviceType] || orderSummary.serviceType : null;

  if (bookingConfirmed && confirmedDriver) {
    return (
      <ScreenShell style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        <FindingDriverBody
          confirmedDriver={confirmedDriver}
          dateTimeStr={dateTimeStr}
          styles={styles}
        />
      </ScreenShell>
    );
  }

  return (
    <View style={styles.root}>
      <MapBackground stops={stops} driverMarkers={onlineDrivers} style={StyleSheet.absoluteFill} />

      <FindingDriverRadarWrap
        ring1Style={ring1Style}
        ring2Style={ring2Style}
        styles={styles}
      />

      <TouchableOpacity style={[styles.backBtn, { top: insets.top + 10 }]} onPress={() => setShowCancelSheet(true)}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>

      <FindingDriverSheet
        dropStop={dropStop}
        orderSummary={orderSummary}
        pickupStop={pickupStop}
        setShowCancelSheet={setShowCancelSheet}
        spinStyle={spinStyle}
        styles={styles}
        tierLabel={tierLabel}
      />

      <CancelRideSheet
        CANCEL_REASONS={CANCEL_REASONS}
        accent={accent}
        cancelReason={cancelReason}
        handleCancel={handleCancel}
        insets={insets}
        setCancelReason={setCancelReason}
        setShowCancelSheet={setShowCancelSheet}
        showCancelSheet={showCancelSheet}
        styles={styles}
      />
    </View>
  );
}
