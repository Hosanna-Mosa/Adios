import React from "react";
import { useTranslation } from "react-i18next";

import { useOnboardingCtx } from "../../OnboardingContext";
import { bankStyles } from "../../onboarding.styles";
import { fieldMessage, validateAccountMatch, validateBankAccount, validateIfsc } from "@/utils/validation";
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
  const accountCode = validateBankAccount(docs.bankAccount);
  const ifscCode = validateIfsc(docs.ifsc);
  const matches = validateAccountMatch(docs.bankAccount, docs.bankConfirm) === null;

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
          error={docs.bankAccount.length >= 9 ? fieldMessage(t, accountCode) : undefined}
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
          error={docs.ifsc.length >= 11 ? fieldMessage(t, ifscCode) : undefined}
        />
        {!docs.bankVerified ? (
          <PrimaryButton
            title={t("onboarding.saveBankAccount")}
            onPress={handleVerifyBank}
            disabled={!!accountCode || !matches || !docs.bankConfirm || !!ifscCode}
            icon="shield"
          />
        ) : (
          <InfoBanner
            icon="check-circle"
            text={t("onboarding.bankAccountSavedTeamWillVerify")}
          />
        )}
      </Box>
    </Box>
  );
}
