import React from "react";
import { useTranslation } from "react-i18next";

import Colors from "@/constants/colors";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { GpsVerifiedBox, OrderStage, StageActionButton, WaitNotification } from "../order";
import { CancelDeliveryButton } from "./CancelDeliveryButton";
import { RestaurantOtpEntry } from "./RestaurantOtpEntry";

export function DeliveryArrivedPickupStage() {
  const { t } = useTranslation();
  const { verification, handleStatusTransition } = useActiveOrderCtx();
  const hasCode = !!verification.restaurantOTP.trim();

  return (
    <OrderStage title={t("jobs.arrivedAtRestaurant")}>
      <GpsVerifiedBox
        title={t("jobs.gpsCheckVerified")}
        description={t("jobs.within20MetersOfRestaurant")}
      />

      <WaitNotification
        message={
          <>{t("jobs.enterPickupCodeFromRestaurant")}</>
        }
      />

      <RestaurantOtpEntry />

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
