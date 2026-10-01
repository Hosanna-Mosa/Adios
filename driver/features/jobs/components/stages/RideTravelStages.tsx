import React from "react";
import { Linking } from "react-native";
import { useTranslation } from "react-i18next";

import { styles } from "../../active-order.styles";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import {
  ContactHeaderRow,
  CustomerRow,
  OrderStage,
  RoundCommButton,
  StageActionButton,
} from "../order";
import { SimPanel } from "./SimPanel";
import { AppText } from "@/components/ui/AppText";

export function RideEnRoutePickupStage() {
  const { t } = useTranslation();
  const { currentOrder, pickupStop, isSimulating, handleStatusTransition } = useActiveOrderCtx();

  return (
    <OrderStage title={t("jobs.travelToUserPickup")} showPulse={isSimulating}>
      <SimPanel target={pickupStop} idleEta={currentOrder.duration} idleDistance={currentOrder.distance} />

      <ContactHeaderRow
        name={<>{t("jobs.userColon", { value: currentOrder.customerName || t("jobs.customer"), defaultValue: "User: {{value}}" })}</>}
        address={pickupStop?.address}
        actions={
          <RoundCommButton
            icon="call"
            onPress={() => Linking.openURL(`tel:${currentOrder.customerPhone || "1234567890"}`)}
          />
        }
      />

      <StageActionButton label={t("jobs.arrivedAtPickupLocation")} onPress={handleStatusTransition} />
    </OrderStage>
  );
}

export function RideInProgressStage() {
  const { t } = useTranslation();
  const { currentOrder, deliveryStop, isSimulating, handleStatusTransition } = useActiveOrderCtx();

  return (
    <OrderStage title={t("jobs.tripInProgress")} showPulse={isSimulating}>
      <SimPanel target={deliveryStop} idleEta={currentOrder.duration} idleDistance={currentOrder.distance} />

      <CustomerRow
        initial={(currentOrder.customerName || t("jobs.rider")).charAt(0).toUpperCase()}
        name={currentOrder.customerName || t("jobs.rider")}
      >
        <AppText style={styles.infoLabel}>{t("jobs.headingToDestination")}</AppText>
        <AppText style={styles.addressText} numberOfLines={1}>
          {deliveryStop?.address}
        </AppText>
      </CustomerRow>

      <StageActionButton label={t("jobs.arrivedAtDestination")} onPress={handleStatusTransition} />
    </OrderStage>
  );
}
