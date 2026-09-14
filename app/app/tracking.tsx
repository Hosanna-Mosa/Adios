import { Dimensions, Linking, ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { TripCompleteScreen } from "@/features/ride/components/TripCompleteScreen";
import { MapBackground } from "@/components/MapBackground";
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
import { useTracking } from "@/features/ride/useTracking";
import type { TimelineStep } from "@/features/ride/useTracking";
import { STATUS_ORDER } from "@/features/ride/useTracking";
import type { OrderStatus } from "@/contexts/deliveryStore";
import { TrackingSection11 } from "@/features/ride/components/TrackingSection11";

export default function TrackingScreen() {
  const {
  status, currentOrderId, route, stops, driver, unreadCount, insets, tokens, isRide, isHelper,
  vendorName, accent, styles, eta, orderCreatedAt, deliveredAt, tripModalVisible,
  setTripModalVisible, helperStatus, deliveryOtp, startOtp, driverLocation, radius, totalPrice,
  mapRef, handleSOS, handleShareTrip, pulse1Style, pulse2Style, deliveryStop, pickupStop,
  handleBack, userLocCoords, bannerText
  } = useTracking();
  const { t } = useTranslation();

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

  // --------------------------------------------------------------------- Live tracking state
  // ---------------------------------------------------------------------

  const timeline = buildTimeline(status, isRide, isHelper, t);
  const pickupLabel = vendorName || pickupStop?.address || stops?.[0]?.address || "Pickup location";

  return (
    <ScreenShell>
      <TrackingSection11
        status={status}
        currentOrderId={currentOrderId}
        route={route}
        stops={stops}
        driver={driver}
        unreadCount={unreadCount}
        insets={insets}
        tokens={tokens}
        isRide={isRide}
        isHelper={isHelper}
        accent={accent}
        styles={styles}
        eta={eta}
        orderCreatedAt={orderCreatedAt}
        tripModalVisible={tripModalVisible}
        setTripModalVisible={setTripModalVisible}
        helperStatus={helperStatus}
        deliveryOtp={deliveryOtp}
        startOtp={startOtp}
        driverLocation={driverLocation}
        radius={radius}
        totalPrice={totalPrice}
        mapRef={mapRef}
        handleSOS={handleSOS}
        handleShareTrip={handleShareTrip}
        pulse1Style={pulse1Style}
        pulse2Style={pulse2Style}
        deliveryStop={deliveryStop}
        userLocCoords={userLocCoords}
        bannerText={bannerText}
        timeline={timeline}
        pickupLabel={pickupLabel}
        formatClock={formatClock}
      />
    </ScreenShell>
  );
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

/** Collapses the granular backend status enum into the 4-node checklist the
 * design calls for, per service group. Every "done"/"current" flag below is
 * derived from the real order status — nothing here is a fabricated
 * timestamp or invented sub-step. */
function buildTimeline(status: OrderStatus, isRide: boolean, isHelper: boolean, t: TFunction): TimelineStep[] {
  const idx = STATUS_ORDER.indexOf(status === "delivered" ? "delivered" : status);
  const at = (s: OrderStatus) => idx >= STATUS_ORDER.indexOf(s);

  if (isRide) {
    const labels = [t("app.tracking.rideLabels.captainAssigned"), t("app.tracking.rideLabels.headingToPickup"), t("app.tracking.rideLabels.tripInProgress"), t("app.tracking.rideLabels.tripCompleted")];
    const done = [at("driver_assigned"), at("arrived_pickup"), at("arrived_delivery"), at("delivered")];
    const currentIdx = done.lastIndexOf(false);
    return labels.map((label, i) => ({ label, done: done[i], current: i === currentIdx }));
  }
  if (isHelper) {
    const labels = [t("app.tracking.helperLabels.offerAccepted"), t("app.tracking.helperLabels.helperArrived"), t("app.tracking.helperLabels.taskInProgress"), t("app.tracking.helperLabels.taskCompleted")];
    const done = [at("driver_assigned"), at("arrived_pickup"), at("en_route_delivery"), at("delivered")];
    const currentIdx = done.lastIndexOf(false);
    return labels.map((label, i) => ({ label, done: done[i], current: i === currentIdx }));
  }
  const labels = [t("app.tracking.deliveryLabels.orderPlaced"), t("app.tracking.deliveryLabels.prepared"), t("app.tracking.deliveryLabels.outForDelivery"), t("app.tracking.deliveryLabels.delivered")];
  const done = [true, at("en_route_delivery"), at("arrived_delivery"), at("delivered")];
  const currentIdx = done.lastIndexOf(false);
  return labels.map((label, i) => ({ label, done: done[i], current: i === currentIdx }));
}
