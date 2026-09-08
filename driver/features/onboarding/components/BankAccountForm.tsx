import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../payout-setup.styles";
import { BankField } from "./BankField";

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
  return (
    <View style={styles.card}>
      <BankField
        label="Account Number"
        icon="credit-card"
        value={accountNumber}
        onChangeText={onAccountNumberChange}
        placeholder="Enter account number"
        keyboardType="number-pad"
      />

      <BankField
        label="Confirm Account Number"
        icon="check-square"
        value={confirmAccount}
        onChangeText={onConfirmAccountChange}
        placeholder="Re-enter account number"
        keyboardType="number-pad"
      />

      {confirmAccount.length > 0 && !accountsMatch && (
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={15} color={Colors.error} />
          <Text style={styles.errorText}>Account numbers don&apos;t match</Text>
        </View>
      )}

      <BankField
        label="IFSC Code"
        icon="map-pin"
        value={ifsc}
        onChangeText={onIfscChange}
        placeholder="SBIN0001234"
        autoCapitalize="characters"
      />
    </View>
  );
}
