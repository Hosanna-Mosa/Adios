import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { TripCompleteScreen } from "@/features/ride/components/TripCompleteScreen";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useTracking, STATUS_ORDER } from "@/features/ride/useTracking";
import type { TimelineStep } from "@/features/ride/useTracking";
import type { OrderStatus } from "@/contexts/deliveryStore";
import { TrackingScreenBody } from "@/features/ride/components/TrackingScreenBody";

export default function TrackingScreen() {
  const {
  status, currentOrderId, route, stops, driver, unreadCount, insets, tokens, isRide, isHelper,
  vendorName, accent, styles, eta, orderCreatedAt, deliveredAt, tripModalVisible,
  setTripModalVisible, helperStatus, deliveryOtp, startOtp, isPackageDelivery, driverLocation, radius, totalPrice,
  mapRef, handleSOS, handleShareTrip, deliveryStop, pickupStop,
  handleBack, userLocCoords, bannerText, refresh, refreshing
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
  // A restaurant / meat-shop order: map markers for both ends, and no delivery PIN —
  // the rider hands these over without one. Rides end without one too (they still
  // start with the start-ride PIN); package deliveries and helper tasks keep theirs.
  // A package delivery is a bike/auto ride with no start PIN and a mandatory delivery OTP.
  const outletOrder = !isRide && !isHelper && !!vendorName;

  return (
    <ScreenShell>
      <TrackingScreenBody
        status={status}
        outletOrder={outletOrder}
        rideOrder={!!isRide}
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
        deliveryOtp={outletOrder || (isRide && !isPackageDelivery) ? null : deliveryOtp}
        startOtp={isPackageDelivery ? null : startOtp}
        isPackageDelivery={isPackageDelivery}
        driverLocation={driverLocation}
        radius={radius}
        totalPrice={totalPrice}
        mapRef={mapRef}
        handleSOS={handleSOS}
        handleShareTrip={handleShareTrip}
        deliveryStop={deliveryStop}
        userLocCoords={userLocCoords}
        bannerText={bannerText}
        timeline={timeline}
        pickupLabel={pickupLabel}
        formatClock={formatClock}
        onRefresh={refresh}
        refreshing={refreshing}
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

  // The step in progress is the first one not yet done. `lastIndexOf(false)` picked
  // the final step instead, so a just-assigned ride highlighted "Trip completed".
  const steps = (labels: string[], done: boolean[]): TimelineStep[] => {
    const currentIdx = done.indexOf(false);
    return labels.map((label, i) => ({ label, done: done[i], current: i === currentIdx }));
  };

  if (isRide) {
    return steps(
      [t("app.tracking.rideLabels.captainAssigned"), t("app.tracking.rideLabels.headingToPickup"), t("app.tracking.rideLabels.tripInProgress"), t("app.tracking.rideLabels.tripCompleted")],
      [at("driver_assigned"), at("arrived_pickup"), at("arrived_delivery"), at("delivered")]
    );
  }
  if (isHelper) {
    // Three steps, because that is all a helper task actually has: the driver
    // accepts, starts the work (IN_PROGRESS), and closes it with the customer's
    // PIN. The old four-step version included an "arrived" node nothing ever set,
    // so the checklist stalled there for the whole task.
    return steps(
      [t("app.tracking.helperLabels.helperAssigned"), t("app.tracking.helperLabels.taskInProgress"), t("app.tracking.helperLabels.taskCompleted")],
      [at("driver_assigned"), at("en_route_delivery"), at("delivered")]
    );
  }
  return steps(
    [t("app.tracking.deliveryLabels.orderPlaced"), t("app.tracking.deliveryLabels.prepared"), t("app.tracking.deliveryLabels.outForDelivery"), t("app.tracking.deliveryLabels.delivered")],
    [true, at("en_route_delivery"), at("arrived_delivery"), at("delivered")]
  );
}
