import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";

import { outletKey } from "../../orderStops";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { OtpEntry } from "../order";

export function RestaurantOtpEntry({ style }: { style?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation();
  const { verification, currentOrder } = useActiveOrderCtx();

  return (
    <OtpEntry
      label={t(outletKey(currentOrder, "jobs.restaurantPickupCode"))}
      placeholder={t("jobs.enter4DigitPickupCode")}
      maxLength={8}
      value={verification.restaurantOTP}
      onChangeText={(val) => {
        verification.setRestaurantOTP(val);
        verification.setRestaurantOTPError(false);
      }}
      hasError={verification.restaurantOTPError}
      errorText={t(outletKey(currentOrder, "jobs.invalidCodeAskRestaurantForPickupCode"))}
      style={style}
    />
  );
}
