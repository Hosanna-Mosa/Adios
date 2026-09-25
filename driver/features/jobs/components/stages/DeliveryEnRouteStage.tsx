import { router } from "expo-router";
import React from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";

import { styles } from "../../active-order.styles";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { CustomerRow, OrderStage, RoundCommButton, StageActionButton } from "../order";
import { CancelDeliveryButton } from "./CancelDeliveryButton";
import { SimPanel } from "./SimPanel";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

export function DeliveryEnRouteStage() {
  const { t } = useTranslation();
  const { currentOrder, deliveryStop, isSimulating, handleStatusTransition } = useActiveOrderCtx();

  return (
    <OrderStage title={t("jobs.travelToCustomer")} showPulse={isSimulating}>
      <SimPanel target={deliveryStop} idleEta="12 min" idleDistance="3.1 km" />

      <CustomerRow
        initial={(currentOrder.customerName || t("jobs.customer")).charAt(0).toUpperCase()}
        name={currentOrder.customerName || t("jobs.customer")}
        trailing={
          <Box style={styles.communicationBtns}>
            <RoundCommButton
              icon="call"
              onPress={() =>
                Alert.alert(
                  t("jobs.callingCustomer"),
                  t("jobs.connectingCallTo", { value: currentOrder.customerPhone, defaultValue: "Connecting call to {{value}}..." }),
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

      <StageActionButton label={t("jobs.arrivedAtCustomer")} onPress={handleStatusTransition} />
      <CancelDeliveryButton />
    </OrderStage>
  );
}
