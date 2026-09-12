import { router } from "expo-router";
import React from "react";
import { Linking, View } from "react-native";

import { styles } from "../../active-order.styles";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import {
  ContactActions,
  RoundCommButton,
  StageActionButton,
  StageTitleRow,
  StopInfoItem,
  StopsDivider,
  StopsPanel,
  UnreadBadge,
} from "../order";
import { CancelDeliveryButton } from "./CancelDeliveryButton";
import { PickupNavButton } from "./PickupNavButton";

export function DeliveryAcceptedStage() {
  const {
    currentOrder, pickupStop, deliveryStop, unreadCount, handleStatusTransition,
  } = useActiveOrderCtx();

  return (
    <View style={styles.stepContainer}>
      <StageTitleRow
        title="Order Accepted"
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
              onPress={() => Linking.openURL(`tel:${currentOrder.vendorPhone || "1234567890"}`)}
            />
            <PickupNavButton pickupStop={pickupStop} />
          </ContactActions>
        }
      />
      <StopsPanel>
        <StopInfoItem
          label="Pickup From"
          name={currentOrder.vendorName || pickupStop?.locationName || "Restaurant"}
          address={pickupStop?.address}
          layout="row"
        />
        <StopsDivider />
        <StopInfoItem
          label="Deliver To"
          name={currentOrder.customerName || "Customer"}
          address={deliveryStop?.address}
        />
      </StopsPanel>

      <StageActionButton label="Start Travel to Restaurant" onPress={handleStatusTransition} />
      <CancelDeliveryButton />
    </View>
  );
}
