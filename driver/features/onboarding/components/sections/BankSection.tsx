import React from "react";
import { View } from "react-native";

import { useOnboardingCtx } from "../../OnboardingContext";
import { bankStyles } from "../../onboarding.styles";
import { BankMismatchRow } from "../BankMismatchRow";
import { BankNotice } from "../BankNotice";
import { FormInput } from "../FormInput";
import { InfoBanner } from "../InfoBanner";
import { PrimaryButton } from "../PrimaryButton";

const digits = (t: string) => t.replace(/[^0-9]/g, "").slice(0, 18);

export function BankSection() {
  const { docs, handleVerifyBank } = useOnboardingCtx();

  return (
    <View style={bankStyles.wrap}>
      <BankNotice
        title="Secure payout setup"
        text="Add the account where your delivery earnings should be settled."
      />

      <View style={bankStyles.card}>
        <FormInput
          label="Account Number"
          value={docs.bankAccount}
          onChangeText={(t) => docs.setBankAccount(digits(t))}
          placeholder="Enter account number"
          keyboardType="number-pad"
          icon="credit-card"
        />
        <FormInput
          label="Confirm Account Number"
          value={docs.bankConfirm}
          onChangeText={(t) => docs.setBankConfirm(digits(t))}
          placeholder="Re-enter account number"
          keyboardType="number-pad"
          icon="check-square"
        />
        {!!docs.bankConfirm && docs.bankAccount !== docs.bankConfirm && (
          <BankMismatchRow message="Account numbers don&apos;t match" />
        )}
        <FormInput
          label="IFSC Code"
          value={docs.ifsc}
          onChangeText={(t) => docs.setIfsc(t.toUpperCase().slice(0, 11))}
          placeholder="SBIN0001234"
          autoCapitalize="characters"
          icon="map-pin"
        />
        {!docs.bankVerified ? (
          <PrimaryButton
            title="Verify Bank Account"
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
            text="Bank account verified! Payouts will be sent here."
          />
        )}
      </View>
    </View>
  );
}
