import React from "react";
import { useTranslation } from "react-i18next";

import Colors from "@/constants/colors";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { GpsVerifiedBox, OrderStage, StageActionButton, WaitNotification } from "../order";
import { CancelDeliveryButton } from "./CancelDeliveryButton";
import { RestaurantOtpEntry } from "./RestaurantOtpEntry";
import { isOutletOrder } from "../../orderStops";
import { useRestaurantReadyPoll } from "../../hooks/useRestaurantReadyPoll";

export function DeliveryArrivedPickupStage() {
  const { t } = useTranslation();
  const { currentOrder, verification, handleStatusTransition } = useActiveOrderCtx();
  // Restaurant / meat-shop orders: the pickup code can't be entered until the outlet
  // has tapped "Mark as ready" (the server refuses the pickup before that too).
  const ready = !isOutletOrder(currentOrder) || !!currentOrder.foodReadyAt;
  useRestaurantReadyPoll(currentOrder?.id, !ready);
  const hasCode = ready && !!verification.restaurantOTP.trim();

  return (
    <OrderStage title={t("jobs.arrivedAtRestaurant")}>
      <GpsVerifiedBox
        title={t("jobs.gpsCheckVerified")}
        description={t("jobs.within20MetersOfRestaurant")}
      />

      <WaitNotification
        message={
          <>{ready ? t("jobs.enterPickupCodeFromRestaurant") : t("jobs.restaurantNotReadyYet")}</>
        }
      />

      {ready ? <RestaurantOtpEntry /> : null}

      <StageActionButton
        label={hasCode ? t("jobs.verifyAndPickUp") : t("jobs.waitingForRestaurant")}
        onPress={handleStatusTransition}
        disabled={!hasCode}
        style={{ backgroundColor: hasCode ? Colors.brand : Colors.textMuted }}
      />
      <CancelDeliveryButton />
    </OrderStage>
  );
}
