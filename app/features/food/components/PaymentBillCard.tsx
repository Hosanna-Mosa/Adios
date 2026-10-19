import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { type ThemeTokens } from "@/constants/colors";
import { type PaymentStyles } from "@/features/food/usePayment.shared";
import { formatINR } from "@/utils/pricing";

// Moved out of app/payment.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  couponCode: any;
  deliveryFee: number | null;
  discount: number;
  styles: PaymentStyles;
  subtotal: number;
  tip: number;
  tokens: ThemeTokens;
  total: number;
}

export function PaymentBillCard({
  couponCode,
  deliveryFee,
  discount,
  styles,
  subtotal,
  tip,
  tokens,
  total,
}: Props) {
  // Same keys as Checkout's bill: this card was all hardcoded English.
  const { t } = useTranslation();
  return (
    <View style={styles.billCard}>
      <View style={styles.billRow}>
        <Text style={styles.billLabel}>{t("app.food.itemTotal")}</Text>
        <Text style={styles.billValue}>₹{formatINR(subtotal)}</Text>
      </View>
      {deliveryFee != null ? (
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>{t("app.food.deliveryFee")}</Text>
          <Text style={styles.billValue}>{deliveryFee === 0 ? t("app.food.free") : `₹${formatINR(deliveryFee)}`}</Text>
        </View>
      ) : (
        <Text style={styles.billNote}>{t("app.food.deliveryFeeIsConfirmedWithYour")}</Text>
      )}
      {tip > 0 && (
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>{t("app.food.deliveryTip")}</Text>
          <Text style={styles.billValue}>₹{formatINR(tip)}</Text>
        </View>
      )}
      {discount > 0 && (
        <View style={styles.billRow}>
          <Text style={[styles.billLabel, { color: tokens.success }]}>{t("app.food.coupon")} {couponCode}</Text>
          <Text style={[styles.billValue, { color: tokens.success }]}>−₹{formatINR(discount)}</Text>
        </View>
      )}
      <View style={styles.billDivider} />
      <View style={styles.billRow}>
        <Text style={styles.billTotalLabel}>{t("app.food.toPay")}</Text>
        <Text style={styles.billTotalValue}>₹{formatINR(total)}</Text>
      </View>
    </View>
  );
}
