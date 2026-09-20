import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { Field } from "../../utils/format";
import { modalStyles } from "../../profile-tab.styles";
import { EditField } from "../EditField";
import { ModalActionButton, ModalFormActions } from "../ModalFormActions";
import { SectionFieldRows } from "../SectionFieldRows";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

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
    <Box>
      <SectionFieldRows fields={fields} />

      {accounts.length > 0 && (
        <Box style={modalStyles.bankList}>
          <AppText style={modalStyles.bankListTitle}>Your Bank Accounts</AppText>
          {accounts.map((ba, idx) => (
            <Box key={idx} style={modalStyles.bankItem}>
              <Box style={modalStyles.bankItemDot}>
                <Feather
                  name={ba.verified ? "check-circle" : "clock"}
                  size={16}
                  color={ba.verified ? Colors.success : Colors.warning}
                />
              </Box>
              <Box style={modalStyles.bankItemCopy}>
                <AppText style={modalStyles.bankItemNumber}>{ba.accountNumber}</AppText>
                <AppText style={modalStyles.bankItemIfsc}>IFSC: {ba.ifsc}</AppText>
              </Box>
              {ba.isDefault && (
                <Box style={modalStyles.defaultBadge}>
                  <AppText style={modalStyles.defaultBadgeText}>Default</AppText>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      {showForm ? (
        <Box style={modalStyles.bankFormWrap}>
          <AppText style={modalStyles.bankFormTitle}>Add Bank Account</AppText>
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
        </Box>
      ) : (
        <ModalActionButton
          icon={<Feather name="plus-circle" size={15} color={Colors.primary} />}
          label={accounts.length >= 3 ? "Maximum 3 accounts reached" : "Add Bank Account"}
          onPress={onOpenForm}
        />
      )}
    </Box>
  );
}
