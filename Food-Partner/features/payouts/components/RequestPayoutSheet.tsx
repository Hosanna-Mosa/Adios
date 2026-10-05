import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { formatCurrency } from "@/utils/format";
import type { PayoutsStyles } from "../payouts.styles";

interface Props {
  visible: boolean;
  available: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** The amount as typed, when it is a valid number — shown on the confirm button. */
  parsedAmount: number | null;
  sending: boolean;
  onWithdrawAll: () => void;
  onSubmit: () => void;
  onClose: () => void;
  styles: PayoutsStyles;
}

/** Choose how much to withdraw — the whole balance is filled in — and confirm. */
export function RequestPayoutSheet({ visible, available, value, onChange, error, parsedAmount, sending, onWithdrawAll, onSubmit, onClose, styles }: Props) {
  const { t } = useTranslation();
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      dismissible={!sending}
      title={t("payouts.sheetTitle")}
      subtitle={t("payouts.sheetSubtitle", { amount: formatCurrency(available) })}
    >
      <View style={styles.sheetBody}>
        <TextField
          label={t("payouts.amountLabel")}
          value={value}
          onChangeText={onChange}
          error={error}
          keyboardType="decimal-pad"
          autoFocus
          onSubmitEditing={onSubmit}
          editable={!sending}
          icon={<Text style={styles.currency}>₹</Text>}
        />
        <Button title={t("payouts.withdrawAll", { amount: formatCurrency(available) })} variant="link" onPress={onWithdrawAll} disabled={sending} />
        <Button
          title={parsedAmount ? t("payouts.confirm", { amount: formatCurrency(parsedAmount) }) : t("payouts.request")}
          onPress={onSubmit}
          loading={sending}
          fullWidth
        />
      </View>
    </BottomSheet>
  );
}
