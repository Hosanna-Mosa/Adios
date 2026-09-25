import React, { useMemo } from "react";
import { Text, View, Animated } from "react-native";
import { useTranslation } from "react-i18next";
import Colors from "@/constants/colors";
import { OrderStatus } from "@/contexts/deliveryStore";
import { useThemeStore } from "@/contexts/themeStore";
import { createStyles } from "./OrderStatusTimeline.styles";

interface StatusStep {
  key: OrderStatus;
  label: string;
}

// STEPS and RIDE_STEPS moved inside OrderStatusTimeline() as useMemo values
// so their labels can call t() — see
// ADIOS_MULTILINGUAL_DEVELOPMENT_PLAN.md, Section 11. `key` values are
// status codes, untouched.

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

const RIDE_STATUS_ORDER: OrderStatus[] = [
  "confirmed",
  "driver_assigned",
  "en_route_pickup",
  "arrived_pickup",
  "en_route_delivery",
  "arrived_delivery",
  "delivered",
];

interface Props {
  currentStatus: OrderStatus;
  serviceType?: string;
}

export function OrderStatusTimeline({ currentStatus, serviceType }: Props) {
  const { t } = useTranslation();
  const STEPS: StatusStep[] = useMemo(() => [
    { key: "confirmed", label: t("app.orderStatusTimeline.steps.orderConfirmed") },
    { key: "driver_assigned", label: t("app.orderStatusTimeline.steps.driverAssigned") },
    { key: "en_route_pickup", label: t("app.orderStatusTimeline.steps.onTheWayToStore") },
    { key: "arrived_pickup", label: t("app.orderStatusTimeline.steps.arrivedAtStore") },
    { key: "picking_items", label: t("app.orderStatusTimeline.steps.pickingItems") },
    { key: "en_route_delivery", label: t("app.orderStatusTimeline.steps.onTheWayToYou") },
    { key: "arrived_delivery", label: t("app.orderStatusTimeline.steps.arrivedAtDelivery") },
    { key: "delivered", label: t("app.orderStatusTimeline.steps.delivered") },
  ], [t]);
  const RIDE_STEPS: StatusStep[] = useMemo(() => [
    { key: "confirmed", label: t("app.orderStatusTimeline.rideSteps.rideBooked") },
    { key: "driver_assigned", label: t("app.orderStatusTimeline.rideSteps.captainAssigned") },
    { key: "en_route_pickup", label: t("app.orderStatusTimeline.rideSteps.captainOnTheWay") },
    { key: "arrived_pickup", label: t("app.orderStatusTimeline.rideSteps.captainArrived") },
    { key: "en_route_delivery", label: t("app.orderStatusTimeline.rideSteps.tripInProgress") },
    { key: "arrived_delivery", label: t("app.orderStatusTimeline.rideSteps.arrivedAtDestination") },
    { key: "delivered", label: t("app.orderStatusTimeline.rideSteps.tripCompleted") },
  ], [t]);
  const isRide = ["bike", "auto", "cab", "cab_prime"].includes(serviceType?.toLowerCase() || "");
  const steps = isRide ? RIDE_STEPS : STEPS;
  const statusOrder = isRide ? RIDE_STATUS_ORDER : STATUS_ORDER;

  let effectiveStatus = currentStatus;
  if (isRide && currentStatus === "picking_items") {
    effectiveStatus = "arrived_pickup";
  }

  const currentIndex = statusOrder.indexOf(effectiveStatus);
  const activeStep = steps[currentIndex] || steps[0];

  const theme = useThemeStore((s) => s.theme);
  const colors = Colors[theme];
  const styles = React.useMemo(() => createStyles(colors), [theme]);

  // Pulse animations for the active indicator
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(0.6)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 2.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim, pulseAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.singleLineRow}>
        <View style={styles.pulseContainer}>
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }], opacity: opacityAnim }]} />
          <View style={styles.pulseDot} />
        </View>
        <Text style={styles.statusLabel}>{activeStep.label}</Text>
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>
      </View>
    </View>
  );
}
