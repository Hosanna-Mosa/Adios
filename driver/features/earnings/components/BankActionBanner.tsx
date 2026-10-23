import React from "react";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";

import { Colors } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { formatCurrency } from "@/utils/format";
import { AppText } from "@/components/ui/AppText";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";

/**
 * Shown when the admin couldn't pay a payout to the bank account on file and asked for other or
 * corrected details. The amount is still reserved; saving new details sends it back to the admin.
 */
export function BankActionBanner({
  amount,
  reason,
  onUpdate,
}: {
  amount: number;
  reason: string;
  onUpdate: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Box style={s.card}>
      <Box style={s.head}>
        <Feather name="alert-circle" size={18} color={Colors.warning} />
        <AppText style={s.title}>
          {t("earnings.bankActionTitle", { defaultValue: "Your payout needs new bank details" })}
        </AppText>
      </Box>
      <AppText style={s.body}>
        {reason
          ? t("earnings.bankActionBodyReason", {
              defaultValue: "We couldn't pay {{amount}} to your bank account: {{reason}}. Add correct or different bank details and we'll pay it again.",
              amount: formatCurrency(amount, { decimals: false }),
              reason,
            })
          : t("earnings.bankActionBody", {
              defaultValue: "We couldn't pay {{amount}} to your bank account. Add correct or different bank details and we'll pay it again.",
              amount: formatCurrency(amount, { decimals: false }),
            })}
      </AppText>
      <Button
        title={t("earnings.bankActionButton", { defaultValue: "Update bank details" })}
        onPress={onUpdate}
        fullWidth
      />
    </Box>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.warningLight,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.warning + "40",
  },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: Colors.text },
  body: { fontSize: typography.sizes.medium, color: Colors.textSecondary },
});
