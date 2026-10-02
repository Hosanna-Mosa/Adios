import { router } from "expo-router";
import React from "react";
import { Linking } from "react-native";
import { useTranslation } from "react-i18next";

import { styles } from "../../active-order.styles";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import {
  ContactActions,
  OrderStage,
  RoundCommButton,
  StageActionButton,
  StopInfoItem,
  StopsDivider,
  UnreadBadge,
} from "../order";
import { Box } from "@/components/ui/Box";

export function RideAcceptedStage() {
  const { t } = useTranslation();
  const {
    currentOrder, pickupStop, deliveryStop, unreadCount,
    openRideNavigation, handleStatusTransition,
  } = useActiveOrderCtx();

  return (
    <OrderStage title={t("jobs.rideAccepted")}>
      <Box style={styles.infoBox}>
        <StopInfoItem
          label={t("jobs.pickupLocation")}
          name={currentOrder.customerName || t("jobs.rider")}
          address={pickupStop?.address}
          layout="row"
          actions={
            <ContactActions>
              <RoundCommButton
                icon="chatbubble-ellipses"
                onPress={() =>
                  router.push({ pathname: "/chat", params: { orderId: currentOrder.id } })
                }
              >
                <UnreadBadge count={unreadCount} />
              </RoundCommButton>
              <RoundCommButton
                icon="call"
                onPress={() =>
                  Linking.openURL(`tel:${currentOrder.customerPhone || "1234567890"}`)
                }
              />
              <RoundCommButton icon="location" onPress={openRideNavigation} />
            </ContactActions>
          }
        />
        <StopsDivider />
        <StopInfoItem
          label={t("jobs.destinationLocation")}
          name={deliveryStop?.locationName || t("jobs.destination")}
          address={deliveryStop?.address}
        />
      </Box>

      <StageActionButton label={t("jobs.startTravelToPickup")} onPress={handleStatusTransition} />
    </OrderStage>
  );
}
