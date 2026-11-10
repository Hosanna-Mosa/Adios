import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { type PaymentOptionsStyles } from "../paymentOptions.styles";
import { type PendingFoodPayment } from "../foodPaymentStore";

// Top of the Payment options screen: what is being paid for, and from where to where.

interface Props {
  pending: PendingFoodPayment;
  styles: PaymentOptionsStyles;
}

const formatSlot = (iso: string) =>
  new Date(iso).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export function PaymentOrderSummary({ pending, styles }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHead}>
        <Text style={styles.summaryItems}>{t("app.food.itemCount", { count: pending.itemCount })}</Text>
        <Text style={styles.summaryTotal}>{t("app.payment.toPayAmount", { amount: pending.total })}</Text>
      </View>

      <View style={styles.routeRow}>
        <View style={styles.routeRail}>
          <View style={styles.routeDot} />
          <View style={styles.routeLine} />
          <View style={styles.routeDot} />
        </View>
        <View style={styles.routeStops}>
          <View>
            <Text style={styles.routeTitle} numberOfLines={1}>{pending.vendorName}</Text>
            <Text style={styles.routeSub} numberOfLines={1}>
              {pending.scheduledFor
                ? t("app.payment.scheduledFor", { slot: formatSlot(pending.scheduledFor) })
                : t("app.food.deliverNow")}
            </Text>
          </View>
          <View>
            {!!pending.addressLabel && <Text style={styles.routeTitle} numberOfLines={1}>{pending.addressLabel}</Text>}
            <Text style={styles.routeSub} numberOfLines={2}>{pending.addressLine}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
