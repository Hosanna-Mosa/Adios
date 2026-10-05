import React from "react";
import { useTranslation } from "react-i18next";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { CashCollectionPanel, OrderStage, OtpEntry, StageActionButton, StageSpacer } from "../order";
import { CancelDeliveryButton } from "./CancelDeliveryButton";
import { isOutletOrder } from "../../orderStops";

export function DeliveryArrivedStage() {
  const { t } = useTranslation();
  const { currentOrder, verification, handleStatusTransition } = useActiveOrderCtx();
  // Restaurant / meat-shop orders are handed over without the customer's OTP.
  const needsOtp = !isOutletOrder(currentOrder);

  return (
    <OrderStage title={t("jobs.confirmCustomerDelivery")}>
      <CashCollectionPanel />

      {needsOtp ? (
      <OtpEntry
        label={t("jobs.customerConfirmationOtp")}
        placeholder={t("jobs.enter4DigitOtp")}
        maxLength={4}
        value={verification.customerOTP}
        onChangeText={(val) => {
          verification.setCustomerOTP(val);
          verification.setCustomerOTPError(false);
        }}
        hasError={verification.customerOTPError}
        errorText={t("jobs.invalidOtpAskCustomerDeliveryCode")}
      />
      ) : null}

      <StageSpacer />
      <StageActionButton
        label={needsOtp ? t("jobs.verifyOtpAndCompleteDelivery") : t("jobs.completeDelivery")}
        onPress={handleStatusTransition}
      />
      <CancelDeliveryButton />
    </OrderStage>
  );
}
