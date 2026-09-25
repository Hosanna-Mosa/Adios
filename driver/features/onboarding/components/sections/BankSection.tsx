import React from "react";
import { useTranslation } from "react-i18next";

import { useOnboardingCtx } from "../../OnboardingContext";
import { bankStyles } from "../../onboarding.styles";
import { BankMismatchRow } from "../BankMismatchRow";
import { BankNotice } from "../BankNotice";
import { FormInput } from "../FormInput";
import { InfoBanner } from "../InfoBanner";
import { PrimaryButton } from "../PrimaryButton";
import { Box } from "@/components/ui/Box";

const digits = (t: string) => t.replace(/[^0-9]/g, "").slice(0, 18);

export function BankSection() {
  const { t } = useTranslation();
  const { docs, handleVerifyBank } = useOnboardingCtx();

  return (
    <Box style={bankStyles.wrap}>
      <BankNotice
        title={t("onboarding.securePayoutSetup")}
        text={t("onboarding.addTheAccountWhereEarningsSettled")}
      />

      <Box style={bankStyles.card}>
        <FormInput
          label={t("onboarding.accountNumber")}
          value={docs.bankAccount}
          onChangeText={(t) => docs.setBankAccount(digits(t))}
          placeholder={t("onboarding.enterAccountNumber")}
          keyboardType="number-pad"
          icon="credit-card"
        />
        <FormInput
          label={t("onboarding.confirmAccountNumber")}
          value={docs.bankConfirm}
          onChangeText={(t) => docs.setBankConfirm(digits(t))}
          placeholder={t("onboarding.reEnterAccountNumber")}
          keyboardType="number-pad"
          icon="check-square"
        />
        {!!docs.bankConfirm && docs.bankAccount !== docs.bankConfirm && (
          <BankMismatchRow message={t("onboarding.accountNumbersDontMatch")} />
        )}
        <FormInput
          label={t("onboarding.ifscCode")}
          value={docs.ifsc}
          onChangeText={(t) => docs.setIfsc(t.toUpperCase().slice(0, 11))}
          placeholder="SBIN0001234"
          autoCapitalize="characters"
          icon="map-pin"
        />
        {!docs.bankVerified ? (
          <PrimaryButton
            title={t("onboarding.verifyBankAccount")}
            onPress={handleVerifyBank}
            disabled={
              docs.bankAccount.length < 9 ||
              docs.bankAccount !== docs.bankConfirm ||
              docs.ifsc.length < 8
            }
            icon="shield"
          />
        ) : (
          <InfoBanner
            icon="check-circle"
            text={t("onboarding.bankAccountVerifiedPayoutsWillBeSentHere")}
          />
        )}
      </Box>
    </Box>
  );
}
