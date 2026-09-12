import React from "react";

import { AppModal } from "@/components/shared/AppModal";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { styles } from "../earnings.styles";
import { formatCurrency } from "../utils/format";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Password confirmation before a Razorpay payout. */
export function CashOutDialog({
  visible,
  amount,
  password,
  onPasswordChange,
  onConfirm,
  onCancel,
  isCashingOut,
}: {
  visible: boolean;
  amount: number;
  password: string;
  onPasswordChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isCashingOut: boolean;
}) {
  return (
    <AppModal visible={visible} onClose={onCancel} presentation="card">
      <AppText style={styles.modalTitle}>Confirm Cash Out</AppText>
      <AppText style={styles.modalText}>
        {formatCurrency(amount)} will be transferred through Razorpay.
      </AppText>
      <TextField
        value={password}
        onChangeText={onPasswordChange}
        placeholder="Driver password"
        secureTextEntry
        style={{ marginBottom: 14 }}
      />
      <Box style={styles.modalActions}>
        <Button
          title="Cancel"
          variant="secondary"
          size="sm"
          onPress={onCancel}
          disabled={isCashingOut}
        />
        <Button title="Confirm" size="sm" onPress={onConfirm} loading={isCashingOut} />
      </Box>
    </AppModal>
  );
}
