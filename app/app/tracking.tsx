import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Dimensions, Linking, ScrollView, Share, StyleSheet, View } from "react-native";
import { interpolate, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { router, useLocalSearchParams } from "expo-router";

import { TripCompleteScreen } from "@/features/ride/components/TripCompleteScreen";
import { createStyles } from "@/features/ride/tracking.styles";

import { designTokens, type ThemeTokens } from "@/constants/colors";

import { useDeliveryStore, OrderStatus } from "@/contexts/deliveryStore";
import { useThemeStore } from "@/contexts/themeStore";
import { socketService } from "@/utils/socketService";
import { customFetch } from "@/utils/api/custom-fetch";
import { MapBackground, MapBackgroundRef } from "@/components/MapBackground";
import { BottomSheet } from "@/components/BottomSheet";

import { TrackingFooterBtnOutline } from "@/features/ride/components/TrackingFooterBtnOutline";
import { TrackingFooterBtnOutline2 } from "@/features/ride/components/TrackingFooterBtnOutline2";
import { TrackingFooterBtnOutline3 } from "@/features/ride/components/TrackingFooterBtnOutline3";
import { TrackingFooterBtnOutline4 } from "@/features/ride/components/TrackingFooterBtnOutline4";
import { TrackingAddrCard } from "@/features/ride/components/TrackingAddrCard";
import { TrackingHelperUpdate } from "@/features/ride/components/TrackingHelperUpdate";
import { TrackingPinCard } from "@/features/ride/components/TrackingPinCard";
import { TrackingPinCard2 } from "@/features/ride/components/TrackingPinCard2";
import { TrackingPinCard3 } from "@/features/ride/components/TrackingPinCard3";
import { TrackingPartnerRow } from "@/features/ride/components/TrackingPartnerRow";
import { TrackingTimelineBlock } from "@/features/ride/components/TrackingTimelineBlock";
import { TrackingFindingWrap } from "@/features/ride/components/TrackingFindingWrap";
import { TrackingTopBar } from "@/features/ride/components/TrackingTopBar";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { TripDetailsModal } from "@/features/ride/components/TripDetailsModal";

const RIDE_TYPES = ["bike", "auto", "cab", "cab_prime"];

const STATUS_ORDER: OrderStatus[] = [
  "confirmed",
  "driver_assigned",
  "en_route_pickup",
  "arrived_pickup",
  "picking_items",
  "en_route_delivery",
  "arrived_delivery",
  "delivered",
];

function normalizeStatus(backendStatus: string): OrderStatus {
  const s = backendStatus.toLowerCase();
  switch (s) {
    case "created":
    case "searching_driver":
      return "confirmed";
    case "driver_assigned":
      return "driver_assigned";
    case "en_route_pickup":
    case "on_the_way":
      return "en_route_pickup";
    case "arrived_pickup":
      return "arrived_pickup";
    case "picking_items":
      return "picking_items";
    case "en_route_delivery":
    case "in_transit":
      return "en_route_delivery";
    case "arrived_delivery":
      return "arrived_delivery";
    case "delivered":
    case "completed":
      return "delivered";
    case "cancelled":
      return "cancelled";
    default:
      return "confirmed";
  }
}

function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = Math.PI / 180;
  const phi1 = lat1 * rad;
  const phi2 = lat2 * rad;
  const deltaLambda = (lng2 - lng1) * rad;
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  return (theta * (180 / Math.PI) + 360) % 360;
}

function calculateDynamicETA(
  driverLoc: { lat: number; lng: number } | null,
  targetLoc: { lat: number; lng: number } | null,
  fallbackEta: number
): number {
  if (!driverLoc || !targetLoc || !driverLoc.lat || !targetLoc.lat) return fallbackEta;
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (targetLoc.lat - driverLoc.lat) * rad;
  const dLng = (targetLoc.lng - driverLoc.lng) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(driverLoc.lat * rad) * Math.cos(targetLoc.lat * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  const minutes = Math.round((distanceKm / 22) * 60);
  return Math.max(1, minutes);
}

function formatClock(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.max(1, Math.round(ms / 60000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h <= 0) return `${m} min`;
  return `${h} h ${m} m`;
}

type TimelineStep = { label: string; done: boolean; current: boolean };

/** Collapses the granular backend status enum into the 4-node checklist the
 * design calls for, per service group. Every "done"/"current" flag below is
 * derived from the real order status — nothing here is a fabricated
 * timestamp or invented sub-step. */
function buildTimeline(status: OrderStatus, isRide: boolean, isHelper: boolean): TimelineStep[] {
  const idx = STATUS_ORDER.indexOf(status === "delivered" ? "delivered" : status);
  const at = (s: OrderStatus) => idx >= STATUS_ORDER.indexOf(s);

  if (isRide) {
    const labels = ["Captain assigned", "Heading to pickup", "Trip in progress", "Trip completed"];
    const done = [at("driver_assigned"), at("arrived_pickup"), at("arrived_delivery"), at("delivered")];
    const currentIdx = done.lastIndexOf(false);
    return labels.map((label, i) => ({ label, done: done[i], current: i === currentIdx }));
  }
  if (isHelper) {
    const labels = ["Offer accepted", "Helper arrived", "Task in progress", "Task completed"];
    const done = [at("driver_assigned"), at("arrived_pickup"), at("en_route_delivery"), at("delivered")];
    const currentIdx = done.lastIndexOf(false);
    return labels.map((label, i) => ({ label, done: done[i], current: i === currentIdx }));
  }
  const labels = ["Order placed", "Prepared", "Out for delivery", "Delivered"];
  const done = [true, at("en_route_delivery"), at("arrived_delivery"), at("delivered")];
  const currentIdx = done.lastIndexOf(false);
  return labels.map((label, i) => ({ label, done: done[i], current: i === currentIdx }));
}

export default function TrackingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const {
    status,
    setStatus,
    currentOrderId,
    setOrderId,
    serviceType,
    setServiceType,
    route,
    setRoute,
    stops,
    setStops,
    driver,
    setDriver,
    unreadCount,
    resetDelivery,
  } = useDeliveryStore();

  const { theme } = useThemeStore();
  const tokens = designTokens[theme];

  const isRide = RIDE_TYPES.includes(serviceType?.toLowerCase() || "");
  const isHelper = serviceType?.toLowerCase() === "helper";

  const [vendorName, setVendorName] = useState<string | null>(null);
  const [vendorPartnerType, setVendorPartnerType] = useState<string | null>(null);
  const accentKey: keyof ThemeTokens["services"] = isRide
    ? "ride"
    : isHelper
      ? "task"
      : vendorPartnerType === "meat"
        ? "meat"
        : vendorName
          ? "food"
          : "delivery";
  const accent = tokens.services[accentKey];
  const styles = useMemo(() => createStyles(tokens, accent), [theme, accentKey]);

  const [eta, setEta] = useState(15);
  const [orderCreatedAt, setOrderCreatedAt] = useState<Date | null>(null);
  const [deliveredAt, setDeliveredAt] = useState<Date | null>(null);
  const [tripModalVisible, setTripModalVisible] = useState(false);
  const [helperStatus, setHelperStatus] = useState<string>("");
  const [deliveryOtp, setDeliveryOtp] = useState<string | null>(null);
  const [startOtp, setStartOtp] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number; heading?: number } | null>(null);
  const [radius, setRadius] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const mapRef = useRef<MapBackgroundRef>(null);

  const cancellationAlerted = useRef(false);

  const handleOrderCancelledByDriver = () => {
    if (cancellationAlerted.current) return;
    cancellationAlerted.current = true;
    resetDelivery();
    router.replace("/(tabs)");
    setTimeout(() => {
      Alert.alert("Order cancelled", "We're sorry — this order could not be completed and has been cancelled.", [{ text: "OK", onPress: () => {} }], { cancelable: true });
    }, 500);
  };

  const handleSOS = () => {
    if (!currentOrderId) return;
    Alert.alert(
      "Emergency SOS",
      "This will instantly alert our support team and your emergency contacts.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Trigger SOS",
          style: "destructive",
          onPress: async () => {
            try {
              await customFetch(`/orders/${currentOrderId}/sos`, { method: "POST" });
              Alert.alert("SOS dispatched", "Your emergency alert has been sent. Support is on the way.");
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to trigger SOS. Please call emergency services.");
            }
          },
        },
      ]
    );
  };

  const handleShareTrip = async () => {
    try {
      await Share.share({
        message: `I'm on a Flavour ${isRide ? "ride" : "trip"}${driver?.name ? ` with ${driver.name}` : ""}. Heading to ${stops?.[stops.length - 1]?.address || "my destination"}.`,
      });
    } catch {
      // user dismissed the share sheet
    }
  };

  // Radar / pulse animation shown only while no driver is assigned yet.
  const pulse1 = useSharedValue(0);
  const pulse2 = useSharedValue(0);
  useEffect(() => {
    if (driver) return;
    // Each pulse loops its own [pause, animate] cycle — pulse2's 1000ms pause
    // before every animation is what staggers it relative to pulse1.
    pulse1.value = withRepeat(withTiming(1, { duration: 2000 }), -1, false);
    pulse2.value = withRepeat(withSequence(withTiming(0, { duration: 1000 }), withTiming(1, { duration: 2000 })), -1, false);
  }, [driver, pulse1, pulse2]);

  const pulse1Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse1.value, [0, 1], [1, 2.2]) }],
    opacity: interpolate(pulse1.value, [0, 1], [0.5, 0]),
  }));
  const pulse2Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse2.value, [0, 1], [1, 2.2]) }],
    opacity: interpolate(pulse2.value, [0, 1], [0.5, 0]),
  }));

  useEffect(() => {
    if (cancellationAlerted.current) return;
    if (params.orderId && params.orderId !== currentOrderId) setOrderId(params.orderId);
  }, [params.orderId, currentOrderId]);

  useEffect(() => {
    if (status === "cancelled") handleOrderCancelledByDriver();
  }, [status]);

  const deliveryStop = stops?.find((s) => s.type?.toLowerCase() === "delivery" || s.type?.toLowerCase() === "drop");
  const pickupStop = stops?.find((s) => s.type?.toLowerCase() === "pickup" || s.type?.toLowerCase() === "store");

  useEffect(() => {
    if (!currentOrderId) return;

    const fetchOrderDetails = () => {
      customFetch<any>(`/orders/${currentOrderId}`)
        .then((order) => {
          if (!order) return;
          if (order.status) {
            const statusStr = String(order.status).toLowerCase();
            if (statusStr === "cancelled" || statusStr === "cancelled_by_driver") {
              handleOrderCancelledByDriver();
              return;
            }
            const normalized = normalizeStatus(order.status);
            setStatus(normalized);
            if (normalized === "delivered") setDeliveredAt((prev) => prev || new Date());
          }
          if (order.driver) {
            setDriver({
              id: order.driver._id,
              name: order.driver.name || order.driver.user?.name || order.driver.firstName || "Driver",
              phone: order.driver.phone || order.driver.user?.phone || "",
              vehicle: order.driver.vehicleType || "unknown",
            });
            if (order.driver.currentLocation?.coordinates) {
              const coords = order.driver.currentLocation.coordinates;
              if (coords[0] != null && coords[1] != null) {
                setDriverLocation((prev) => {
                  const lat = coords[1];
                  const lng = coords[0];
                  if (!prev || Math.abs(prev.lat - lat) > 0.00001 || Math.abs(prev.lng - lng) > 0.00001) {
                    const heading = prev && (prev.lat !== lat || prev.lng !== lng) ? calculateBearing(prev.lat, prev.lng, lat, lng) : prev?.heading || 0;
                    return { lat, lng, heading };
                  }
                  return prev;
                });
              }
            }
          }
          if (order.vendor && typeof order.vendor === "object") {
            setVendorName(order.vendor.name || null);
            setVendorPartnerType(order.vendor.partnerType || null);
          }
          if (order.stops?.length > 0) {
            setStops(
              order.stops.map((s: any) => ({
                id: s._id,
                address: s.address,
                lat: s.location.coordinates[1],
                lng: s.location.coordinates[0],
                type: s.type,
                items: s.items?.lines || [],
              }))
            );
          }
          if (order.radius) setRadius(order.radius);
          if (order.deliveryOtp) setDeliveryOtp(order.deliveryOtp);
          if (order.serviceType) setServiceType(order.serviceType);
          if (order.restaurantPickupCode) setStartOtp(order.restaurantPickupCode);
          if (order.totalPrice != null) setTotalPrice(order.totalPrice);
          if (order.createdAt) setOrderCreatedAt((prev) => prev || new Date(order.createdAt));
          if (order.duration) {
            const durMinutes = parseInt(order.duration.toString().replace(/[^0-9]/g, ""), 10) || 15;
            setEta(durMinutes);
          }
          if (order.polyline) {
            setRoute({ totalDistance: order.totalDistance || 0, estimatedTime: order.duration || 15, polyline: order.polyline });
          }
        })
        .catch((err) => console.error("Error fetching order in tracking:", err));
    };

    fetchOrderDetails();
    const interval = setInterval(fetchOrderDetails, 7000);
    return () => clearInterval(interval);
  }, [currentOrderId]);

  useEffect(() => {
    if (!currentOrderId) return;
    socketService.connect();
    socketService.trackOrder(currentOrderId);

    const onOrderAccepted = (data: any) => {
      setDriver(data.driver);
      setStatus("driver_assigned");
    };

    const onLocationUpdate = (data: any) => {
      if (data.lat == null || data.lng == null) return;
      setDriverLocation((prev) => {
        let heading = data.heading;
        if (!heading && prev) {
          const dLat = Math.abs(prev.lat - data.lat);
          const dLng = Math.abs(prev.lng - data.lng);
          heading = dLat > 0.00001 || dLng > 0.00001 ? calculateBearing(prev.lat, prev.lng, data.lat, data.lng) : prev.heading;
        }
        return { lat: data.lat, lng: data.lng, heading: heading || 0 };
      });

      const activeStop =
        status === "pending" || status === "confirmed" || status === "driver_assigned" || status === "en_route_pickup" || status === "arrived_pickup"
          ? pickupStop || stops?.[0]
          : deliveryStop || stops?.[stops.length - 1];
      if (activeStop && activeStop.lat != null && activeStop.lng != null) {
        setEta(calculateDynamicETA({ lat: data.lat, lng: data.lng }, { lat: Number(activeStop.lat), lng: Number(activeStop.lng) }, eta));
      }
    };

    const onStatusUpdate = (data: any) => {
      if (!data.status) return;
      const statusStr = String(data.status).toLowerCase();
      if (statusStr === "cancelled" || statusStr === "cancelled_by_driver") {
        handleOrderCancelledByDriver();
        return;
      }
      const normalized = normalizeStatus(data.status);
      setStatus(normalized);
      if (normalized === "delivered") setDeliveredAt((prev) => prev || new Date());
    };

    const onOrderCancelled = () => handleOrderCancelledByDriver();
    const onHelperStatusUpdate = (data: { text: string }) => {
      if (data.text) setHelperStatus(data.text);
    };

    socketService.on("order_accepted", onOrderAccepted);
    socketService.on("driver_location_update", onLocationUpdate);
    socketService.on("order_status_update", onStatusUpdate);
    socketService.on("order_cancelled", onOrderCancelled);
    socketService.on("helper_status_update", onHelperStatusUpdate);

    const timer = setInterval(() => setEta((prev) => Math.max(1, prev - 1)), 30000);

    return () => {
      clearInterval(timer);
      socketService.off("order_accepted", onOrderAccepted);
      socketService.off("driver_location_update", onLocationUpdate);
      socketService.off("order_status_update", onStatusUpdate);
      socketService.off("order_cancelled", onOrderCancelled);
      socketService.off("helper_status_update", onHelperStatusUpdate);
    };
  }, [currentOrderId]);

  const handleBack = () => router.replace("/(tabs)/orders");
  const userLocCoords = deliveryStop ? { lat: Number(deliveryStop.lat), lng: Number(deliveryStop.lng) } : null;

  // ---------------------------------------------------------------------
  // Completed state
  // ---------------------------------------------------------------------
  if (status === "delivered") {
    const foodItems = deliveryStop?.items || [];
    const elapsed = orderCreatedAt && deliveredAt ? formatDuration(deliveredAt.getTime() - orderCreatedAt.getTime()) : null;
    const headline = isRide ? "Ride completed" : isHelper ? "Task complete" : "Order delivered";
    const subline = isRide
      ? `You arrived safely${driver?.name ? ` with ${driver.name}` : ""}.`
      : isHelper
        ? `${driver?.name || "Your helper"} finished the task${elapsed ? ` in ${elapsed}` : ""}.`
        : `Delivered by ${driver?.name || "your delivery partner"}${elapsed ? ` in ${elapsed}` : ""}.`;

    return (
      <TripCompleteScreen
        foodItems={foodItems}
        headline={headline}
        subline={subline}
        accent={accent}
        currentOrderId={currentOrderId}
        deliveryStop={deliveryStop}
        handleBack={handleBack}
        insets={insets}
        isHelper={isHelper}
        isRide={isRide}
        stops={stops}
        styles={styles}
        tokens={tokens}
        totalPrice={totalPrice}
      />
    );
  }

  // ---------------------------------------------------------------------
  // Live tracking state
  // ---------------------------------------------------------------------
  let bannerText = isHelper ? "Helper is on the way" : isRide ? "Captain on the way" : "Heading to pickup";
  if (status === "arrived_pickup") bannerText = isRide ? "Captain has arrived" : isHelper ? "Helper has arrived" : "Arrived at the store";
  else if (status === "en_route_delivery") bannerText = isRide ? "Trip in progress" : isHelper ? "Task in progress" : "Out for delivery";
  else if (status === "arrived_delivery") bannerText = isRide ? "Arrived at destination" : "Arrived at your location";

  const timeline = buildTimeline(status, isRide, isHelper);
  const pickupLabel = vendorName || pickupStop?.address || stops?.[0]?.address || "Pickup location";

  return (
    <ScreenShell>
      <MapBackground
        ref={mapRef}
        stops={stops}
        polyline={["en_route_delivery", "arrived_delivery"].includes(status) ? route?.polyline : undefined}
        driverLocation={driverLocation}
        userLocation={userLocCoords}
        radiusCenter={stops?.[0]?.lat !== undefined && stops?.[0]?.lng !== undefined ? { lat: stops[0].lat, lng: stops[0].lng } : null}
        radiusMeters={radius ? radius * 1000 : undefined}
        style={StyleSheet.absoluteFill}
      />

      <TrackingTopBar
        bannerText={bannerText}
        accent={accent}
        eta={eta}
        insets={insets}
        status={status}
        styles={styles}
        tokens={tokens}
      />

      <BottomSheet style={styles.bottomSheet} defaultHeight={Dimensions.get("window").height * 0.5} disableExpand={false}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {!driver ? (
            <TrackingFindingWrap
              accent={accent}
              isHelper={isHelper}
              isRide={isRide}
              pulse1Style={pulse1Style}
              pulse2Style={pulse2Style}
              styles={styles}
            />
          ) : (
            <>
              {/* Timeline */}
              <TrackingTimelineBlock
                formatClock={formatClock}
                accent={accent}
                eta={eta}
                helperStatus={helperStatus}
                isHelper={isHelper}
                orderCreatedAt={orderCreatedAt}
                styles={styles}
                timeline={timeline}
                tokens={tokens}
              />

              {/* Partner card */}
              <TrackingPartnerRow
                Linking={Linking}
                accent={accent}
                driver={driver}
                isHelper={isHelper}
                styles={styles}
                tokens={tokens}
                unreadCount={unreadCount}
              />

              {/* PIN blocks */}
              {isRide && startOtp && ["confirmed", "driver_assigned", "en_route_pickup", "arrived_pickup"].includes(status) && (
                <TrackingPinCard
                  accent={accent}
                  startOtp={startOtp}
                  styles={styles}
                />
              )}
              {isRide && deliveryOtp && status === "arrived_delivery" && (
                <TrackingPinCard2
                  accent={accent}
                  deliveryOtp={deliveryOtp}
                  styles={styles}
                />
              )}
              {!isRide && !isHelper && deliveryOtp && (
                <TrackingPinCard3
                  accent={accent}
                  deliveryOtp={deliveryOtp}
                  styles={styles}
                />
              )}

              {/* Helper live status */}
              {isHelper && helperStatus ? (
                <TrackingHelperUpdate
                  accent={accent}
                  helperStatus={helperStatus}
                  styles={styles}
                />
              ) : null}

              {/* Addresses */}
              <TrackingAddrCard
                accent={accent}
                deliveryStop={deliveryStop}
                isRide={isRide}
                pickupLabel={pickupLabel}
                stops={stops}
                styles={styles}
                tokens={tokens}
              />

              {/* Footer actions */}
              {isRide ? (
                <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                  <TrackingFooterBtnOutline
                    handleShareTrip={handleShareTrip}
                    styles={styles}
                  />
                  <TrackingFooterBtnOutline2
                    handleSOS={handleSOS}
                    styles={styles}
                    tokens={tokens}
                  />
                </View>
              ) : (
                <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                  <TrackingFooterBtnOutline3
                    setTripModalVisible={setTripModalVisible}
                    styles={styles}
                  />
                  <TrackingFooterBtnOutline4
                    handleSOS={handleSOS}
                    styles={styles}
                    tokens={tokens}
                  />
                </View>
              )}
              <View style={{ height: 12 }} />
            </>
          )}
        </ScrollView>
      </BottomSheet>

      <TripDetailsModal
        accent={accent}
        currentOrderId={currentOrderId}
        insets={insets}
        pickupLabel={pickupLabel}
        setTripModalVisible={setTripModalVisible}
        stops={stops}
        styles={styles}
        tokens={tokens}
        totalPrice={totalPrice}
        tripModalVisible={tripModalVisible}
      />
    </ScreenShell>
  );
}
