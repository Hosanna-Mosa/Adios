import { router } from "expo-router";
import React from "react";
import { Dimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ActiveOrderProvider } from "@/features/jobs/ActiveOrderContext";
import { useActiveOrder } from "@/features/jobs/hooks/useActiveOrder";
import { styles } from "@/features/jobs/active-order.styles";
import {
  ActiveOrderHeader,
  ActiveOrderMap,
  OrderDetailSheet,
} from "@/features/jobs/components";
import { ActiveOrderStage } from "@/features/jobs/components/stages";

const { height } = Dimensions.get("window");

// Stages with more to show get a taller bottom sheet.
const TALL_SHEET_STATUSES = ["picking_items", "arrived_delivery", "delivered", "completed"];

export default function ActiveOrderScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const order = useActiveOrder();
  const {
    currentOrder, isRide, isHelper, status,
    mapRef, pickupStop, deliveryStop, driverLocation, driverHeading, handleSOS,
  } = order;

  if (!currentOrder) return null;

  const title = isRide
    ? t("jobs.rideActiveTask")
    : isHelper
      ? t("jobs.helperActiveTask")
      : t("jobs.deliveryActiveTask");

  return (
    <ActiveOrderProvider value={order}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ActiveOrderHeader
          title={title}
          onBack={() => router.push("/(tabs)")}
          onSOS={handleSOS}
        />

        <ActiveOrderMap
          mapRef={mapRef}
          pickupStop={pickupStop}
          deliveryStop={deliveryStop}
          driverLocation={driverLocation}
          driverHeading={driverHeading}
          polyline={currentOrder.polyline}
        />

        <OrderDetailSheet
          orderId={currentOrder.id}
          height={TALL_SHEET_STATUSES.includes(status) ? height * 0.62 : height * 0.46}
          paddingBottom={Math.max(insets.bottom, 16) + 12}
        >
          <ActiveOrderStage />
        </OrderDetailSheet>
      </SafeAreaView>
    </ActiveOrderProvider>
  );
}
