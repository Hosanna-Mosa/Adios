import React from "react";
import { useTranslation } from "react-i18next";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { CashCollectionPanel, OptionPicker, OrderStage, OtpEntry, StageActionButton } from "../order";
import { CancelDeliveryButton } from "./CancelDeliveryButton";

const DELIVERY_OPTIONS = ["door", "gate", "contactless"] as const;

export function DeliveryArrivedStage() {
  const { t } = useTranslation();
  const { verification, handleStatusTransition } = useActiveOrderCtx();

  const deliveryOptionLabel = (opt: (typeof DELIVERY_OPTIONS)[number]) =>
    opt === "door" ? t("jobs.deliveryOptionDoor")
    : opt === "gate" ? t("jobs.deliveryOptionGate")
    : t("jobs.deliveryOptionContactless");

  return (
    <OrderStage title={t("jobs.confirmCustomerDelivery")}>
      <OptionPicker
        label={t("jobs.deliveryType")}
        options={DELIVERY_OPTIONS}
        selected={verification.deliveryOption}
        onSelect={verification.setDeliveryOption}
        renderLabel={deliveryOptionLabel}
      />

      <CashCollectionPanel />

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

      <StageActionButton
        label={t("jobs.verifyOtpAndCompleteDelivery")}
        onPress={handleStatusTransition}
      />
      <CancelDeliveryButton />
    </OrderStage>
  );
}
