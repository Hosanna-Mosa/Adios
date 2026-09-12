import { router } from "expo-router";
import React from "react";
import { Alert } from "react-native";

import { styles } from "../../active-order.styles";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { CustomerRow, OrderStage, RoundCommButton, StageActionButton } from "../order";
import { CancelDeliveryButton } from "./CancelDeliveryButton";
import { SimPanel } from "./SimPanel";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

export function DeliveryEnRouteStage() {
  const { currentOrder, deliveryStop, isSimulating, handleStatusTransition } = useActiveOrderCtx();

  return (
    <OrderStage title="Travel to Customer" showPulse={isSimulating}>
      <SimPanel target={deliveryStop} idleEta="12 min" idleDistance="3.1 km" />

      <CustomerRow
        initial={(currentOrder.customerName || "C").charAt(0).toUpperCase()}
        name={currentOrder.customerName || "Customer"}
        trailing={
          <Box style={styles.communicationBtns}>
            <RoundCommButton
              icon="call"
              onPress={() =>
                Alert.alert(
                  "Calling Customer",
                  `Connecting call to ${currentOrder.customerPhone}...`,
                )
              }
            />
            <RoundCommButton
              icon="chatbubble-ellipses"
              onPress={() =>
                router.push({ pathname: "/chat", params: { orderId: currentOrder.id } })
              }
            />
          </Box>
        }
      >
        <AppText style={styles.customerPhoneInside}>{currentOrder.customerPhone || "..."}</AppText>
      </CustomerRow>

      <StageActionButton label="Arrived at Customer" onPress={handleStatusTransition} />
      <CancelDeliveryButton />
    </OrderStage>
  );
}
