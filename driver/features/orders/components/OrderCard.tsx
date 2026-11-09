import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/colors";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { formatCurrency } from "@/utils/format";
import { styles } from "../orders.styles";
import type { DriverOrder } from "../types";
import {
  driverShare, formatTime, isCancelled, isOrderLive, outletName, serviceVisual, stopAddress,
} from "../utils/orderView";
import { OrderRoute } from "./OrderRoute";
import { ServiceChip } from "./ServiceChip";
import { StatusBadge } from "./StatusBadge";

/** One job in the list: what it was, when, where, how far, and what it paid. */
export function OrderCard({ order, onPress }: { order: DriverOrder; onPress: () => void }) {
  const { t, i18n } = useTranslation();
  const visual = serviceVisual(order);
  const kind = t(visual.labelKey, { defaultValue: visual.fallback });
  const title = outletName(order) || kind;
  const distance = Number(order.totalDistance) || 0;
  const share = driverShare(order);
  const paidBy = order.paymentMethod === "online" ? t("orders.paidOnline", { defaultValue: "Paid online" }) : t("orders.cash", { defaultValue: "Cash" });

  return (
    <Touchable activeOpacity={0.85} onPress={onPress} style={[styles.card, isOrderLive(order.status) && styles.cardLive]}>
      <Box style={styles.cardHead}>
        <ServiceChip visual={visual} />
        <Box style={styles.headText}>
          <AppText style={styles.title} numberOfLines={1}>{title}</AppText>
          <AppText style={styles.sub} numberOfLines={1}>
            {title === kind ? formatTime(order.createdAt, i18n.language) : `${kind} · ${formatTime(order.createdAt, i18n.language)}`}
          </AppText>
        </Box>
        <StatusBadge status={order.status} />
      </Box>

      <Box style={styles.cardRoute}>
        <OrderRoute pickup={stopAddress(order, "pickup")} drop={stopAddress(order, "drop")} />
      </Box>

      <Box style={styles.cardFoot}>
        <Box style={styles.metaRow}>
          {distance > 0 ? (
            <Box style={styles.meta}>
              <Ionicons name="navigate-outline" size={14} color={Colors.textSecondary} />
              <AppText style={styles.metaText}>{distance} km</AppText>
            </Box>
          ) : null}
          <Box style={styles.meta}>
            <Ionicons name={order.paymentMethod === "online" ? "card-outline" : "cash-outline"} size={14} color={Colors.textSecondary} />
            <AppText style={styles.metaText}>{paidBy}</AppText>
          </Box>
        </Box>
        <Box>
          <AppText style={styles.earnLabel}>
            {isCancelled(order.status) ? t("orders.noEarnings", { defaultValue: "No earnings" }) : t("orders.youEarn", { defaultValue: "You earn" })}
          </AppText>
          <AppText style={[styles.earn, share === 0 && styles.earnZero]}>{formatCurrency(share, { decimals: false })}</AppText>
        </Box>
      </Box>
    </Touchable>
  );
}
