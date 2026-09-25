import React from "react";
import { useTranslation } from "react-i18next";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { GpsVerifiedBox, OrderStage, OtpEntry, StageActionButton } from "../order";

const OTP_SPACING = { marginTop: 16, marginBottom: 20 };

export function RideArrivedPickupStage() {
  const { t } = useTranslation();
  const { verification, handleStatusTransition } = useActiveOrderCtx();

  return (
    <OrderStage title={t("jobs.arrivedAtPickup")}>
      <GpsVerifiedBox
        title={t("jobs.gpsCheckArrived")}
        description={t("jobs.reachedRidersPickupLocation")}
      />

      <OtpEntry
        label={t("jobs.enterStartRideOtp")}
        placeholder={t("jobs.enter4DigitRideOtp")}
        maxLength={8}
        value={verification.restaurantOTP}
        onChangeText={(val) => {
          verification.setRestaurantOTP(val);
          verification.setRestaurantOTPError(false);
        }}
        hasError={verification.restaurantOTPError}
        errorText={t("jobs.invalidOtpAskRiderForStartRideOtp")}
        style={OTP_SPACING}
      />

      <StageActionButton label={t("jobs.startTrip")} onPress={handleStatusTransition} />
    </OrderStage>
  );
}

export function RideArrivedDeliveryStage() {
  const { t } = useTranslation();
  const { verification, handleStatusTransition } = useActiveOrderCtx();

  return (
    <OrderStage title={t("jobs.confirmRideCompletion")}>
      <GpsVerifiedBox
        title={t("jobs.gpsCheckArrived")}
        description={t("jobs.reachedRidersDestination")}
      />

      <OtpEntry
        label={t("jobs.enterEndRideOtp")}
        placeholder={t("jobs.enter4DigitOtp")}
        maxLength={4}
        value={verification.customerOTP}
        onChangeText={(val) => {
          verification.setCustomerOTP(val);
          verification.setCustomerOTPError(false);
        }}
        hasError={verification.customerOTPError}
        errorText={t("jobs.invalidOtpAskRiderForEndRideOtp")}
        style={OTP_SPACING}
      />

      <StageActionButton label={t("jobs.endTripAndCompleteRide")} onPress={handleStatusTransition} />
    </OrderStage>
  );
}
