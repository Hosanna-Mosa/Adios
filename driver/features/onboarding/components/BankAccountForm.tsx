import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../payout-setup.styles";
import { BankField } from "./BankField";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** The three bank-detail fields plus the mismatch warning between them. */
export function BankAccountForm({
  accountNumber,
  onAccountNumberChange,
  confirmAccount,
  onConfirmAccountChange,
  accountsMatch,
  ifsc,
  onIfscChange,
}: {
  accountNumber: string;
  onAccountNumberChange: (t: string) => void;
  confirmAccount: string;
  onConfirmAccountChange: (t: string) => void;
  accountsMatch: boolean;
  ifsc: string;
  onIfscChange: (t: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Box style={styles.card}>
      <BankField
        label={t("onboarding.accountNumber")}
        icon="credit-card"
        value={accountNumber}
        onChangeText={onAccountNumberChange}
        placeholder={t("onboarding.enterAccountNumber")}
        keyboardType="number-pad"
      />

      <BankField
        label={t("onboarding.confirmAccountNumber")}
        icon="check-square"
        value={confirmAccount}
        onChangeText={onConfirmAccountChange}
        placeholder={t("onboarding.reEnterAccountNumber")}
        keyboardType="number-pad"
      />

      {confirmAccount.length > 0 && !accountsMatch && (
        <Box style={styles.errorRow}>
          <Feather name="alert-circle" size={15} color={Colors.error} />
          <AppText style={styles.errorText}>{t("onboarding.accountNumbersDontMatch")}</AppText>
        </Box>
      )}

      <BankField
        label={t("onboarding.ifscCode")}
        icon="map-pin"
        value={ifsc}
        onChangeText={onIfscChange}
        placeholder="SBIN0001234"
        autoCapitalize="characters"
      />
    </Box>
  );
}
