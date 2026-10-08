import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

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
import { callPhone } from "../../utils/callPhone";
import { CancelDeliveryButton } from "./CancelDeliveryButton";
import { PickupNavButton } from "./PickupNavButton";
import { Box } from "@/components/ui/Box";

export function DeliveryAcceptedStage() {
  const { t } = useTranslation();
  const {
    currentOrder, pickupStop, deliveryStop, unreadCount, handleStatusTransition,
  } = useActiveOrderCtx();

  return (
    <Box style={styles.stepContainer}>
      <StageTitleRow
        title={t("jobs.orderAccepted")}
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
              onPress={() => callPhone(currentOrder.vendorPhone, "restaurant")}
            />
            <PickupNavButton pickupStop={pickupStop} />
          </ContactActions>
        }
      />
      <StopsPanel>
        <StopInfoItem
          label={t("jobs.pickupFrom")}
          name={currentOrder.vendorName || pickupStop?.locationName || t("jobs.restaurant")}
          address={pickupStop?.address}
          layout="row"
        />
        <StopsDivider />
        <StopInfoItem
          label={t("jobs.deliverTo")}
          name={currentOrder.customerName || t("jobs.customer")}
          address={deliveryStop?.address}
        />
      </StopsPanel>

      <StageActionButton label={t("jobs.startTravelToRestaurant")} onPress={handleStatusTransition} />
      <CancelDeliveryButton />
    </Box>
  );
}
