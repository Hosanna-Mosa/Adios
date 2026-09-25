import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { OtpEntry } from "../order";

export function RestaurantOtpEntry({ style }: { style?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation();
  const { verification } = useActiveOrderCtx();

  return (
    <OtpEntry
      label={t("jobs.restaurantPickupCode")}
      placeholder={t("jobs.enter4DigitPickupCode")}
      maxLength={8}
      value={verification.restaurantOTP}
      onChangeText={(val) => {
        verification.setRestaurantOTP(val);
        verification.setRestaurantOTPError(false);
      }}
      hasError={verification.restaurantOTPError}
      errorText={t("jobs.invalidCodeAskRestaurantForPickupCode")}
      style={style}
    />
  );
}
