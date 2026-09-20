import React from "react";
import { Linking } from "react-native";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { ContactHeaderRow, OrderStage, RoundCommButton, StageActionButton } from "../order";
import { CancelDeliveryButton } from "./CancelDeliveryButton";
import { PickupNavButton } from "./PickupNavButton";
import { SimPanel } from "./SimPanel";

export function DeliveryEnRoutePickupStage() {
  const { currentOrder, pickupStop, isSimulating, handleStatusTransition } = useActiveOrderCtx();

  return (
    <OrderStage title="Travel to Restaurant" showPulse={isSimulating}>
      <SimPanel
        target={pickupStop}
        idleEta={currentOrder.duration}
        idleDistance={currentOrder.distance}
      />

      <ContactHeaderRow
        name={<>{currentOrder.vendorName || pickupStop?.locationName || "Restaurant"}</>}
        address={pickupStop?.address}
        actions={
          <>
            <RoundCommButton
              icon="call"
              onPress={() => Linking.openURL(`tel:${currentOrder.vendorPhone || "1234567890"}`)}
            />
            <PickupNavButton pickupStop={pickupStop} />
          </>
        }
      />

      <StageActionButton label="Arrived at Restaurant" onPress={handleStatusTransition} />
      <CancelDeliveryButton />
    </OrderStage>
  );
}
