import { router } from "expo-router";
import React from "react";
import { Linking } from "react-native";

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
  const {
    currentOrder, pickupStop, deliveryStop, unreadCount,
    openRideNavigation, handleStatusTransition,
  } = useActiveOrderCtx();

  return (
    <OrderStage title="Ride Accepted">
      <Box style={styles.infoBox}>
        <StopInfoItem
          label="Pickup Rider From"
          name={currentOrder.customerName || "Rider"}
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
          label="Destination Location"
          name={deliveryStop?.locationName || "Destination"}
          address={deliveryStop?.address}
        />
      </Box>

      <StageActionButton label="Start Travel to Pickup" onPress={handleStatusTransition} />
    </OrderStage>
  );
}
