import React from "react";
import { useTranslation } from "react-i18next";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { CashCollectionPanel, OrderStage, OtpEntry, StageActionButton, StageSpacer } from "../order";
import { CancelDeliveryButton } from "./CancelDeliveryButton";

export function DeliveryArrivedStage() {
  const { t } = useTranslation();
  const { verification, handleStatusTransition } = useActiveOrderCtx();
  // Every delivery, restaurant and meat-shop orders included, ends with the customer's 4-digit code.
  const needsOtp = true;

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
