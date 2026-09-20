import React from "react";
import type { StyleProp, ViewStyle } from "react-native";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { OtpEntry } from "../order";

export function RestaurantOtpEntry({ style }: { style?: StyleProp<ViewStyle> }) {
  const { verification } = useActiveOrderCtx();

  return (
    <OtpEntry
      label="RESTAURANT PICKUP CODE"
      placeholder="Enter 4-digit Pickup Code"
      maxLength={8}
      value={verification.restaurantOTP}
      onChangeText={(val) => {
        verification.setRestaurantOTP(val);
        verification.setRestaurantOTPError(false);
      }}
      hasError={verification.restaurantOTPError}
      errorText="Invalid code. Please ask the restaurant for the correct pickup code."
      style={style}
    />
  );
}
