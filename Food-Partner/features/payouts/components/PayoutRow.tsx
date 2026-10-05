import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Payout, PayoutStatus } from "@/types/models";
import { formatCurrency, formatDateTime } from "@/utils/format";
import type { PayoutsStyles } from "../payouts.styles";

const STATUS: Record<PayoutStatus, { tone: BadgeTone; icon: keyof typeof Ionicons.glyphMap; key: string }> = {
  pending: { tone: "warning", icon: "hourglass-outline", key: "payouts.statusPending" },
  processing: { tone: "info", icon: "sync-outline", key: "payouts.statusProcessing" },
  processed: { tone: "success", icon: "checkmark-circle-outline", key: "payouts.statusProcessed" },
  failed: { tone: "error", icon: "close-circle-outline", key: "payouts.statusFailed" },
};

/** One payout: amount, where it is, when — and the bank reference once paid, or why it failed. */
export function PayoutRow({ payout, styles }: { payout: Payout; styles: PayoutsStyles }) {
  const { t } = useTranslation();
  const status = STATUS[payout.status] ?? STATUS.pending;
  return (
    <Card bordered elevationLevel="none" style={styles.payoutCard}>
      <View style={styles.payoutTop}>
        <Text style={styles.payoutAmount}>{formatCurrency(payout.amount)}</Text>
        <Badge label={t(status.key)} tone={status.tone} icon={status.icon} />
      </View>
      <Text style={styles.payoutMeta}>
        {t("payouts.requestedOn", { date: formatDateTime(payout.requestedAt) })}
        {payout.status === "processed" && payout.paidAt ? ` · ${t("payouts.paidOn", { date: formatDateTime(payout.paidAt) })}` : ""}
      </Text>
      {payout.status === "processed" && payout.reference ? (
        <Text style={styles.payoutReference} selectable>
          {t("payouts.reference", { reference: payout.reference })}
        </Text>
      ) : null}
      {payout.status === "failed" ? (
        <Text style={styles.payoutFailed}>
          {payout.note ? t("payouts.failedWithReason", { reason: payout.note }) : t("payouts.failedHint")}
        </Text>
      ) : null}
    </Card>
  );
}
