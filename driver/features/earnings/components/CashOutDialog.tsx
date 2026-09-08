import React from "react";
import { Text, View } from "react-native";
import { AppModal } from "@/components/shared/AppModal";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { styles } from "../earnings.styles";
import { formatCurrency } from "../utils/format";

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
      <Text style={styles.modalTitle}>Confirm Cash Out</Text>
      <Text style={styles.modalText}>
        {formatCurrency(amount)} will be transferred through Razorpay.
      </Text>
      <TextField
        value={password}
        onChangeText={onPasswordChange}
        placeholder="Driver password"
        secureTextEntry
        style={{ marginBottom: 14 }}
      />
      <View style={styles.modalActions}>
        <Button
          title="Cancel"
          variant="secondary"
          size="sm"
          onPress={onCancel}
          disabled={isCashingOut}
        />
        <Button title="Confirm" size="sm" onPress={onConfirm} loading={isCashingOut} />
      </View>
    </AppModal>
  );
}
