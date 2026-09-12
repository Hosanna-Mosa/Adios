import React from "react";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { OptionPicker, OrderStage, OtpEntry, StageActionButton } from "../order";
import { CancelDeliveryButton } from "./CancelDeliveryButton";

const DELIVERY_OPTIONS = ["door", "gate", "contactless"] as const;

export function DeliveryArrivedStage() {
  const { verification, handleStatusTransition } = useActiveOrderCtx();

  return (
    <OrderStage title="Confirm Customer Delivery">
      <OptionPicker
        label="DELIVERY TYPE"
        options={DELIVERY_OPTIONS}
        selected={verification.deliveryOption}
        onSelect={verification.setDeliveryOption}
      />

      <OtpEntry
        label="CUSTOMER CONFIRMATION OTP"
        placeholder="Enter 4-Digit OTP"
        maxLength={4}
        value={verification.customerOTP}
        onChangeText={(val) => {
          verification.setCustomerOTP(val);
          verification.setCustomerOTPError(false);
        }}
        hasError={verification.customerOTPError}
        errorText="Invalid OTP code. Please ask the customer for the correct delivery code."
      />

      <StageActionButton
        label="Verify OTP & Complete Delivery"
        onPress={handleStatusTransition}
      />
      <CancelDeliveryButton />
    </OrderStage>
  );
}
