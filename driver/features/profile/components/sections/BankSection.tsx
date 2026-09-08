import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { Field } from "../../utils/format";
import { modalStyles } from "../../profile-tab.styles";
import { EditField } from "../EditField";
import { ModalActionButton, ModalFormActions } from "../ModalFormActions";
import { SectionFieldRows } from "../SectionFieldRows";

export interface BankAccount {
  accountNumber: string;
  ifsc: string;
  verified?: boolean;
  isDefault?: boolean;
}

/** Payout details: the accounts on file and the form to add another. */
export function BankSection({
  fields,
  accounts,
  showForm,
  accountNumber,
  onAccountNumberChange,
  ifsc,
  onIfscChange,
  isSaving,
  onOpenForm,
  onCancel,
  onSubmit,
}: {
  fields: Field[];
  accounts: BankAccount[];
  showForm: boolean;
  accountNumber: string;
  onAccountNumberChange: (t: string) => void;
  ifsc: string;
  onIfscChange: (t: string) => void;
  isSaving: boolean;
  onOpenForm: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <View>
      <SectionFieldRows fields={fields} />

      {accounts.length > 0 && (
        <View style={modalStyles.bankList}>
          <Text style={modalStyles.bankListTitle}>Your Bank Accounts</Text>
          {accounts.map((ba, idx) => (
            <View key={idx} style={modalStyles.bankItem}>
              <View style={modalStyles.bankItemDot}>
                <Feather
                  name={ba.verified ? "check-circle" : "clock"}
                  size={16}
                  color={ba.verified ? Colors.success : Colors.warning}
                />
              </View>
              <View style={modalStyles.bankItemCopy}>
                <Text style={modalStyles.bankItemNumber}>{ba.accountNumber}</Text>
                <Text style={modalStyles.bankItemIfsc}>IFSC: {ba.ifsc}</Text>
              </View>
              {ba.isDefault && (
                <View style={modalStyles.defaultBadge}>
                  <Text style={modalStyles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {showForm ? (
        <View style={modalStyles.bankFormWrap}>
          <Text style={modalStyles.bankFormTitle}>Add Bank Account</Text>
          <EditField
            label="Account Number"
            value={accountNumber}
            onChangeText={onAccountNumberChange}
            icon="credit-card"
            placeholder="Enter account number"
            keyboardType="number-pad"
          />
          <EditField
            label="IFSC Code"
            value={ifsc}
            onChangeText={onIfscChange}
            icon="map-pin"
            placeholder="SBIN0001234"
            autoCapitalize="characters"
          />
          <ModalFormActions
            onCancel={onCancel}
            onConfirm={onSubmit}
            confirmLabel="Add Account"
            busyLabel="Adding..."
            busy={isSaving}
          />
        </View>
      ) : (
        <ModalActionButton
          icon={<Feather name="plus-circle" size={15} color={Colors.primary} />}
          label={accounts.length >= 3 ? "Maximum 3 accounts reached" : "Add Bank Account"}
          onPress={onOpenForm}
        />
      )}
    </View>
  );
}
