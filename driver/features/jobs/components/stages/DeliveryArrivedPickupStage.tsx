import React from "react";

import Colors from "@/constants/colors";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { GpsVerifiedBox, OrderStage, StageActionButton, WaitNotification } from "../order";
import { CancelDeliveryButton } from "./CancelDeliveryButton";
import { RestaurantOtpEntry } from "./RestaurantOtpEntry";

export function DeliveryArrivedPickupStage() {
  const { verification, handleStatusTransition } = useActiveOrderCtx();
  const hasCode = !!verification.restaurantOTP.trim();

  return (
    <OrderStage title="Arrived at Restaurant">
      <GpsVerifiedBox
        title="GPS Check: Verified"
        description="You are within 20 meters of restaurant location."
      />

      <WaitNotification
        message={
          <>Enter the pickup code provided by the restaurant to confirm pickup and proceed.</>
        }
      />

      <RestaurantOtpEntry />

      <StageActionButton
        label={hasCode ? "Verify & Pick Up" : "Waiting for Restaurant..."}
        onPress={handleStatusTransition}
        disabled={!hasCode}
        style={{ backgroundColor: hasCode ? Colors.brand : Colors.textMuted }}
      />
      <CancelDeliveryButton />
    </OrderStage>
  );
}
