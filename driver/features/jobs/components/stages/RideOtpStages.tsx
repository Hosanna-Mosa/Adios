import React from "react";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { GpsVerifiedBox, OrderStage, OtpEntry, StageActionButton } from "../order";

const OTP_SPACING = { marginTop: 16, marginBottom: 20 };

export function RideArrivedPickupStage() {
  const { verification, handleStatusTransition } = useActiveOrderCtx();

  return (
    <OrderStage title="Arrived at Pickup">
      <GpsVerifiedBox
        title="GPS Check: Arrived"
        description="You have reached the rider's pickup location."
      />

      <OtpEntry
        label="ENTER START RIDE OTP"
        placeholder="Enter 4-digit Ride OTP"
        maxLength={8}
        value={verification.restaurantOTP}
        onChangeText={(val) => {
          verification.setRestaurantOTP(val);
          verification.setRestaurantOTPError(false);
        }}
        hasError={verification.restaurantOTPError}
        errorText="Invalid OTP code. Please ask the rider for their start ride OTP."
        style={OTP_SPACING}
      />

      <StageActionButton label="Start Trip" onPress={handleStatusTransition} />
    </OrderStage>
  );
}

export function RideArrivedDeliveryStage() {
  const { verification, handleStatusTransition } = useActiveOrderCtx();

  return (
    <OrderStage title="Confirm Ride Completion">
      <GpsVerifiedBox
        title="GPS Check: Arrived"
        description="You have reached the rider's destination."
      />

      <OtpEntry
        label="ENTER END RIDE OTP"
        placeholder="Enter 4-Digit OTP"
        maxLength={4}
        value={verification.customerOTP}
        onChangeText={(val) => {
          verification.setCustomerOTP(val);
          verification.setCustomerOTPError(false);
        }}
        hasError={verification.customerOTPError}
        errorText="Invalid OTP code. Please ask the rider for their end ride OTP."
        style={OTP_SPACING}
      />

      <StageActionButton label="End Trip & Complete Ride" onPress={handleStatusTransition} />
    </OrderStage>
  );
}
