import React from "react";

import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <AppModal visible={visible} onClose={onCancel} presentation="card">
      <AppText style={styles.modalTitle}>{t("earnings.confirmCashOut")}</AppText>
      <AppText style={styles.modalText}>
        {t("earnings.willBeTransferredThroughRazorpay", { value: formatCurrency(amount), defaultValue: "{{value}} will be transferred through Razorpay." })}
      </AppText>
      <TextField
        value={password}
        onChangeText={onPasswordChange}
        placeholder={t("earnings.driverPassword")}
        secureTextEntry
        style={{ marginBottom: 14 }}
      />
      <Box style={styles.modalActions}>
        <Button
          title={t("actions.cancel")}
          variant="secondary"
          size="sm"
          onPress={onCancel}
          disabled={isCashingOut}
        />
        <Button title={t("actions.confirm")} size="sm" onPress={onConfirm} loading={isCashingOut} />
      </Box>
    </AppModal>
  );
}
