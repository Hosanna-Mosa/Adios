import React from "react";
import { useTranslation } from "react-i18next";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { ContactHeaderRow, OrderStage, RoundCommButton, StageActionButton, StageSpacer } from "../order";
import { callPhone } from "../../utils/callPhone";
import { CancelDeliveryButton } from "./CancelDeliveryButton";
import { PickupNavButton } from "./PickupNavButton";

export function DeliveryEnRoutePickupStage() {
  const { t } = useTranslation();
  const { currentOrder, pickupStop, isSimulating, handleStatusTransition } = useActiveOrderCtx();

  return (
    <OrderStage title={t("jobs.travelToRestaurant")} showPulse={isSimulating}>
      <ContactHeaderRow
        name={<>{currentOrder.vendorName || pickupStop?.locationName || t("jobs.restaurant")}</>}
        address={pickupStop?.address}
        actions={
          <>
            <RoundCommButton
              icon="call"
              onPress={() => callPhone(currentOrder.vendorPhone, "restaurant")}
            />
            <PickupNavButton pickupStop={pickupStop} />
          </>
        }
      />

      <StageSpacer />
      <StageActionButton label={t("jobs.arrivedAtRestaurant")} onPress={handleStatusTransition} />
      <CancelDeliveryButton />
    </OrderStage>
  );
}
