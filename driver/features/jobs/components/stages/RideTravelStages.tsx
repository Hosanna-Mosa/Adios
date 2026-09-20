import React from "react";
import { Linking } from "react-native";

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
  const { currentOrder, pickupStop, isSimulating, handleStatusTransition } = useActiveOrderCtx();

  return (
    <OrderStage title="Travel to User Pickup" showPulse={isSimulating}>
      <SimPanel target={pickupStop} idleEta={currentOrder.duration} idleDistance={currentOrder.distance} />

      <ContactHeaderRow
        name={<>User: {currentOrder.customerName || "Customer"}</>}
        address={pickupStop?.address}
        actions={
          <RoundCommButton
            icon="call"
            onPress={() => Linking.openURL(`tel:${currentOrder.customerPhone || "1234567890"}`)}
          />
        }
      />

      <StageActionButton label="Arrived at Pickup Location" onPress={handleStatusTransition} />
    </OrderStage>
  );
}

export function RideInProgressStage() {
  const { currentOrder, deliveryStop, isSimulating, handleStatusTransition } = useActiveOrderCtx();

  return (
    <OrderStage title="Trip In Progress" showPulse={isSimulating}>
      <SimPanel target={deliveryStop} idleEta="12 min" idleDistance="3.1 km" />

      <CustomerRow
        initial={(currentOrder.customerName || "R").charAt(0).toUpperCase()}
        name={currentOrder.customerName || "Rider"}
      >
        <AppText style={styles.infoLabel}>Heading to destination</AppText>
        <AppText style={styles.addressText} numberOfLines={1}>
          {deliveryStop?.address}
        </AppText>
      </CustomerRow>

      <StageActionButton label="Arrived at Destination" onPress={handleStatusTransition} />
    </OrderStage>
  );
}
