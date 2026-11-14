import React from "react";
import { useTranslation } from "react-i18next";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { CashCollectionPanel, GpsVerifiedBox, OrderStage, OtpEntry, PackageDeliveryBanner, StageActionButton } from "../order";

const OTP_SPACING = { marginTop: 16, marginBottom: 20 };

// A ride starts with the rider's start PIN and ends without an OTP. A package delivery needs
// both: the sender's start OTP at pickup and the receiver's delivery OTP at the drop.

export function RideArrivedPickupStage() {
  const { t } = useTranslation();
  const { currentOrder, verification, handleStatusTransition } = useActiveOrderCtx();
  const isPackageDelivery = !!currentOrder.packageDelivery;
  // A package delivery paid in cash at pickup is collected here, from the sender, before the trip starts.
  const collectAtPickup = currentOrder.packageDelivery?.payAt === "pickup";

  return (
    <OrderStage title={t("jobs.arrivedAtPickup")}>
      <GpsVerifiedBox
        title={t("jobs.gpsCheckArrived")}
        description={isPackageDelivery ? t("jobs.packageDeliveryAtPickup") : t("jobs.reachedRidersPickupLocation")}
      />

      <PackageDeliveryBanner order={currentOrder} leg="pickup" />
      {collectAtPickup && <CashCollectionPanel />}

      <OtpEntry
        label={isPackageDelivery ? t("jobs.packageDeliveryEnterStartOtp") : t("jobs.enterStartRideOtp")}
        placeholder={isPackageDelivery ? t("jobs.packageDeliveryStartOtpPlaceholder") : t("jobs.enter4DigitRideOtp")}
        maxLength={8}
        testCode={currentOrder.restaurantPickupCode || currentOrder.id.slice(-4)}
        value={verification.restaurantOTP}
        onChangeText={(val) => {
          verification.setRestaurantOTP(val);
          verification.setRestaurantOTPError(false);
        }}
        hasError={verification.restaurantOTPError}
        errorText={isPackageDelivery ? t("jobs.packageDeliveryInvalidStartOtp") : t("jobs.invalidOtpAskRiderForStartRideOtp")}
        style={OTP_SPACING}
      />

      <StageActionButton
        label={isPackageDelivery ? t("jobs.packageDeliveryStartTrip") : t("jobs.startTrip")}
        onPress={handleStatusTransition}
      />
    </OrderStage>
  );
}

export function RideArrivedDeliveryStage() {
  const { t } = useTranslation();
  const { currentOrder, verification, handleStatusTransition } = useActiveOrderCtx();
  const isPackageDelivery = !!currentOrder.packageDelivery;

  return (
    <OrderStage title={isPackageDelivery ? t("jobs.confirmPackageDelivery") : t("jobs.confirmRideCompletion")}>
      <GpsVerifiedBox
        title={t("jobs.gpsCheckArrived")}
        description={t("jobs.reachedRidersDestination")}
      />

      <PackageDeliveryBanner order={currentOrder} leg="drop" />

      <CashCollectionPanel />

      {isPackageDelivery && (
        <OtpEntry
          label={t("jobs.packageDeliveryEnterOtp")}
          placeholder={t("jobs.packageDeliveryOtpPlaceholder")}
          maxLength={4}
          value={verification.customerOTP}
          onChangeText={(val) => {
            verification.setCustomerOTP(val.replace(/\D/g, ""));
            verification.setCustomerOTPError(false);
          }}
          hasError={verification.customerOTPError}
          errorText={t("jobs.packageDeliveryInvalidOtp")}
          style={OTP_SPACING}
        />
      )}

      <StageActionButton
        label={isPackageDelivery ? t("jobs.packageDeliveryComplete") : t("jobs.endTripAndCompleteRide")}
        onPress={handleStatusTransition}
      />
    </OrderStage>
  );
}
