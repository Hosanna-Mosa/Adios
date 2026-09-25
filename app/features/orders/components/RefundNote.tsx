import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { type ThemeTokens } from "@/constants/colors";
import { type OrdersStyles } from "../orders.styles";

interface Props {
  order: any;
  styles: OrdersStyles;
  tokens: ThemeTokens;
}

/**
 * Refund line on a cancelled order paid online: how much comes back and where it stands.
 * Mirrors the backend's refundStatus (not_requested / pending / processed / failed).
 * Cash orders took no money, so they show nothing.
 */
export type RefundNoteContent = {
  tone: "done" | "waiting";
  key: "refundedOriginal" | "refundedManual" | "refundInProgress" | "refundBeingArranged";
  amount: number;
  reference?: string;
  completedAt?: string;
} | null;

/** What the refund line says for an order, or null when there is nothing to show. */
export function refundNoteContent(order: any): RefundNoteContent {
  if (order?.paymentMethod !== "online" || order?.paymentStatus !== "paid") return null;
  const status: string = order.refundStatus || "not_requested";
  const cancelled = String(order.status).toUpperCase() === "CANCELLED";
  if (!cancelled && status === "not_requested") return null;

  const amount = Math.round(Number(order.refundAmount ?? order.totalPrice) || 0);
  if (status === "processed") {
    return order.refundMethod === "manual"
      ? { tone: "done", key: "refundedManual", amount, reference: order.refundReference || "—", completedAt: order.refundCompletedAt }
      : { tone: "done", key: "refundedOriginal", amount, completedAt: order.refundCompletedAt };
  }
  if (status === "pending") return { tone: "waiting", key: "refundInProgress", amount };
  return { tone: "waiting", key: "refundBeingArranged", amount };
}

export function RefundNote({ order, styles, tokens }: Props) {
  const { t, i18n } = useTranslation();
  const content = refundNoteContent(order);
  if (!content) return null;

  const date = content.completedAt
    ? new Date(content.completedAt).toLocaleDateString(i18n.language, { day: "numeric", month: "short" })
    : "";
  const done = content.tone === "done";
  const color = done ? tokens.success : tokens.sec;
  const icon: keyof typeof Ionicons.glyphMap =
    done ? "checkmark-circle" : content.key === "refundInProgress" ? "time-outline" : "information-circle-outline";

  return (
    <View style={styles.refundRow} accessibilityRole="text">
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.refundText, { color }]}>
        {t(`app.orders.${content.key}`, { amount: content.amount, reference: content.reference, date })}
      </Text>
    </View>
  );
}
