import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { fadeInUp } from "@/motion/presets";
import type { OrderItemLine } from "@/types/models";
import { formatCurrency } from "@/utils/format";
import type { OrderDetailStyles } from "../orderDetail.styles";

interface Props {
  items: OrderItemLine[];
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  styles: OrderDetailStyles;
}

/** What to cook: each line with its quantity, and the order total. */
export function OrderItemsCard({ items, total, paymentMethod, paymentStatus, styles }: Props) {
  const { t } = useTranslation();
  const paidOnline = paymentMethod === "online" && paymentStatus === "paid";
  const count = items.reduce((sum, line) => sum + (line.quantity || 0), 0);
  return (
    <Animated.View entering={fadeInUp(80)}>
      <Card bordered elevationLevel="none">
        <SectionHeader title={t("orderDetail.items", { count })} />
        {items.length === 0 ? <Text style={styles.muted}>{t("orderDetail.noItems")}</Text> : null}
        {items.map((line, index) => (
          <View key={`${line.name}-${index}`} style={[styles.itemRow, index < items.length - 1 && styles.itemDivider]}>
            <Text style={styles.qty}>{line.quantity}×</Text>
            <Text style={styles.itemName}>{line.name}</Text>
            <Text style={styles.itemPrice}>{formatCurrency(line.price * line.quantity)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t("orderDetail.total")}</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        </View>
        {paymentMethod ? (
          <View style={styles.payment}>
            <Badge
              label={paidOnline ? t("orderDetail.paidOnline") : t("orderDetail.cashOnDelivery")}
              tone={paidOnline ? "success" : "neutral"}
              icon={paidOnline ? "card-outline" : "cash-outline"}
            />
          </View>
        ) : null}
      </Card>
    </Animated.View>
  );
}
