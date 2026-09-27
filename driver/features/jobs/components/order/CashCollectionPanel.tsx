import React, { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { useDriverStore } from "@/store/driverStore";
import { paymentFields } from "@/store/orderMapper";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { StageActionButton } from "./StageActionButton";

/**
 * Shown on the last stage of every job (delivery, ride, helper task), above "complete".
 * Online: nothing to collect. Cash: the driver enters what they received and confirms; the
 * backend checks it against the order total and only its answer marks the cash collected.
 */
export function CashCollectionPanel() {
  const { t } = useTranslation();
  const currentOrder = useDriverStore((s) => s.currentOrder);
  const confirmCashCollected = useDriverStore((s) => s.confirmCashCollected);
  const [amountText, setAmountText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentOrder) return null;
  const payment = paymentFields(currentOrder);

  if (payment.paymentMethod === "online") {
    return (
      <Box style={[styles.box, styles.okBox]}>
        <Ionicons name="card-outline" size={22} color={Colors.success} />
        <Box style={styles.text}>
          <AppText style={[styles.title, { color: Colors.success }]}>{t("jobs.paidOnline")}</AppText>
          <AppText style={[styles.desc, { color: Colors.success }]}>{t("jobs.noCashToCollect")}</AppText>
        </Box>
      </Box>
    );
  }

  if (payment.cashCollected) {
    return (
      <Box style={[styles.box, styles.okBox]}>
        <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
        <Box style={styles.text}>
          <AppText style={[styles.title, { color: Colors.success }]}>
            {t("jobs.cashCollectedAmount", { amount: payment.cashCollectedAmount ?? payment.payableAmount })}
          </AppText>
          <AppText style={[styles.desc, { color: Colors.success }]}>{t("jobs.cashRecordedYouCanComplete")}</AppText>
        </Box>
      </Box>
    );
  }

  const submit = () => {
    const amount = Number(amountText.trim());
    if (!Number.isFinite(amount) || amount <= 0) {
      setError(t("jobs.enterCashAmount"));
      return;
    }
    if (Math.round(amount) !== payment.payableAmount) {
      setError(t("jobs.cashAmountMustMatch", { amount: payment.payableAmount }));
      return;
    }
    Alert.alert(
      t("jobs.confirmCashCollected"),
      t("jobs.confirmCashCollectedQuestion", { amount: Math.round(amount) }),
      [
        { text: t("actions.cancel"), style: "cancel" },
        {
          text: t("jobs.yesCollected"),
          onPress: async () => {
            setSubmitting(true);
            setError(null);
            try {
              await confirmCashCollected(Math.round(amount));
            } catch (err: any) {
              setError(err?.message || t("jobs.cashCollectionFailed"));
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Box style={[styles.box, styles.cashBox]}>
      <Box style={styles.headerRow}>
        <Ionicons name="cash-outline" size={22} color={Colors.warning} />
        <Box style={styles.text}>
          <AppText style={[styles.title, { color: Colors.warning }]}>
            {t("jobs.cashToCollect", { amount: payment.payableAmount })}
          </AppText>
          <AppText style={[styles.desc, { color: Colors.warning }]}>{t("jobs.collectCashBeforeCompleting")}</AppText>
        </Box>
      </Box>

      <AppText style={styles.inputLabel}>{t("jobs.amountCollected")}</AppText>
      <AppTextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder={`₹${payment.payableAmount}`}
        placeholderTextColor={Colors.textMuted}
        keyboardType="number-pad"
        maxLength={7}
        value={amountText}
        editable={!submitting}
        onChangeText={(value) => {
          setAmountText(value.replace(/[^0-9]/g, ""));
          setError(null);
        }}
      />
      {!!error && <AppText style={styles.error}>{error}</AppText>}

      <StageActionButton
        label={submitting ? t("jobs.recordingCash") : t("jobs.confirmCashCollected")}
        onPress={submit}
        disabled={submitting}
        style={styles.button}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 16 },
  okBox: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.successLight, borderColor: Colors.successLight },
  cashBox: { backgroundColor: Colors.warningLight, borderColor: Colors.warning },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  text: { marginLeft: 10, flex: 1 },
  title: { fontSize: typography.sizes.medium, fontWeight: "700" },
  desc: { fontSize: typography.sizes.small, marginTop: 1 },
  inputLabel: { fontSize: typography.sizes.small, fontWeight: "600", color: Colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.white,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: typography.sizes.large, color: Colors.text,
  },
  inputError: { borderColor: Colors.error },
  error: { color: Colors.error, fontSize: typography.sizes.small, marginTop: 6 },
  button: { marginTop: 12, backgroundColor: Colors.warning },
});
