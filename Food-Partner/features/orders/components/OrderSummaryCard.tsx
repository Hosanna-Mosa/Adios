import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { fadeInUp } from "@/motion/presets";
import type { PartnerOrder } from "@/types/models";
import { formatDateTime, formatOrderId } from "@/utils/format";
import { orderStatusMeta } from "@/utils/orderStatus";
import type { OrderDetailStyles } from "../orderDetail.styles";

/** Order number, status, time placed — and the pickup code the driver must quote. */
export function OrderSummaryCard({ order, styles }: { order: PartnerOrder; styles: OrderDetailStyles }) {
  const { t } = useTranslation();
  const meta = orderStatusMeta(order);
  return (
    <Animated.View entering={fadeInUp(0)}>
      <Card bordered elevationLevel="none">
        <View style={styles.summaryTop}>
          {/* Takes the room the status badge leaves; a full order id shrinks to fit rather than wrap. */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.orderId} numberOfLines={1} adjustsFontSizeToFit>
              {formatOrderId(order._id)}
            </Text>
            <Text style={styles.placedAt}>{t("orderDetail.placedAt", { time: formatDateTime(order.createdAt) })}</Text>
            {order.prepMinutes ? (
              <Text style={styles.placedAt}>{t("orderDetail.prepTimeQuoted", { count: order.prepMinutes })}</Text>
            ) : null}
          </View>
          <Badge label={t(meta.labelKey)} tone={meta.tone} dot />
        </View>
        {order.restaurantPickupCode ? (
          <View style={styles.codeBox}>
            <View style={styles.codeTexts}>
              <Text style={styles.codeLabel}>{t("orderDetail.pickupCode")}</Text>
              <Text style={styles.codeHint}>{t("orderDetail.pickupCodeHint")}</Text>
            </View>
            <Text style={styles.code}>{order.restaurantPickupCode}</Text>
          </View>
        ) : null}
      </Card>
    </Animated.View>
  );
}
