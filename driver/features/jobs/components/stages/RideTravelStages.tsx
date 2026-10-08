import React from "react";
import { useTranslation } from "react-i18next";

import { styles } from "../../active-order.styles";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import {
  ContactHeaderRow,
  CustomerRow,
  OrderStage,
  PackageDeliveryBanner,
  RoundCommButton,
  StageActionButton,
  StageSpacer,
  TripSummary,
} from "../order";
import { callPhone } from "../../utils/callPhone";
import { Box } from "@/components/ui/Box";
import { PickupNavButton } from "./PickupNavButton";
import { AppText } from "@/components/ui/AppText";

export function RideEnRoutePickupStage() {
  const { t } = useTranslation();
  const { currentOrder, pickupStop, deliveryStop, isSimulating, handleStatusTransition } = useActiveOrderCtx();

  return (
    <OrderStage title={t("jobs.travelToUserPickup")} showPulse={isSimulating}>
      <PackageDeliveryBanner order={currentOrder} leg="pickup" />
      <ContactHeaderRow
        name={<>{t("jobs.userColon", { value: currentOrder.customerName || t("jobs.customer"), defaultValue: "User: {{value}}" })}</>}
        address={pickupStop?.address}
        actions={
          <Box style={styles.communicationBtns}>
            <RoundCommButton
              icon="call"
              onPress={() => callPhone(currentOrder.customerPhone, "customer")}
            />
            <PickupNavButton pickupStop={pickupStop} />
          </Box>
        }
      />

      <TripSummary
        pickup={pickupStop?.address}
        drop={deliveryStop?.address}
        distance={currentOrder.distance}
        duration={currentOrder.duration}
        heading="pickup"
      />

      <StageSpacer />
      <StageActionButton label={t("jobs.arrivedAtPickupLocation")} onPress={handleStatusTransition} />
    </OrderStage>
  );
}

export function RideInProgressStage() {
  const { t } = useTranslation();
  const { currentOrder, pickupStop, deliveryStop, isSimulating, handleStatusTransition, openRideNavigation } = useActiveOrderCtx();

  return (
    <OrderStage title={currentOrder.packageDelivery ? t("jobs.packageDeliveryInTransit") : t("jobs.tripInProgress")} showPulse={isSimulating}>
      <PackageDeliveryBanner order={currentOrder} leg="drop" />
      <CustomerRow
        initial={(currentOrder.customerName || t("jobs.rider")).charAt(0).toUpperCase()}
        name={currentOrder.customerName || t("jobs.rider")}
        trailing={<RoundCommButton icon="navigate" onPress={openRideNavigation} />}
      >
        <AppText style={styles.infoLabel}>{t("jobs.headingToDestination")}</AppText>
        <AppText style={styles.addressText} numberOfLines={1}>
          {deliveryStop?.address}
        </AppText>
      </CustomerRow>

      <TripSummary
        pickup={pickupStop?.address}
        drop={deliveryStop?.address}
        distance={currentOrder.distance}
        duration={currentOrder.duration}
        heading="drop"
      />

      <StageSpacer />
      <StageActionButton label={t("jobs.arrivedAtDestination")} onPress={handleStatusTransition} />
    </OrderStage>
  );
}
