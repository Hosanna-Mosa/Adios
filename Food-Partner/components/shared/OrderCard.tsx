import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useTokens } from "@/contexts/themeStore";
import type { PartnerOrder } from "@/types/models";
import { formatCurrency, formatOrderId, formatRelativeDate } from "@/utils/format";
import { customerOf, needsAction as orderNeedsAction, orderItemCount, orderItems, orderStatusMeta } from "@/utils/orderStatus";

interface Props {
  order: PartnerOrder;
  onPress: () => void;
}

/**
 * One order in a list — on the dashboard, the Orders tab and Help & support.
 * Orders the kitchen still has to hand over get a brand stripe and an
 * "Action needed" tag so they stand out at a glance.
 */
export function OrderCard({ order, onPress }: Props) {
  const { t } = useTranslation();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const meta = orderStatusMeta(order);
  const needsAction = orderNeedsAction(order);
  const items = orderItems(order);
  const preview = items
    .slice(0, 2)
    .map((line) => `${line.quantity}× ${line.name}`)
    .join(", ");

  return (
    <Card
      bordered
      padding={14}
      onPress={onPress}
      accessibilityLabel={t("orders.openOrder", { id: formatOrderId(order._id) })}
      style={[styles.card, needsAction && { borderLeftColor: tokens.brand, borderLeftWidth: 3 }]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconTile, { backgroundColor: needsAction ? tokens.brandSkin : tokens.sunken }]}>
          <Ionicons name="bag-handle" size={moderateScale(18)} color={needsAction ? tokens.brand : tokens.sec} />
        </View>
        <View style={styles.headTexts}>
          <Text style={styles.orderId} numberOfLines={1}>
            {t("orders.orderNumber", { id: formatOrderId(order._id) })}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {[customerOf(order)?.name || t("common.customer"), formatRelativeDate(order.createdAt)].join(" · ")}
          </Text>
        </View>
        <Text style={styles.amount}>{formatCurrency(order.totalPrice)}</Text>
      </View>

      {preview ? (
        <Text style={styles.items} numberOfLines={1}>
          {preview}
          {items.length > 2 ? ` ${t("orders.moreItems", { count: items.length - 2 })}` : ""}
        </Text>
      ) : null}

      <View style={styles.bottomRow}>
        <Badge label={t(meta.labelKey)} tone={meta.tone} dot />
        <View style={styles.bottomRight}>
          {needsAction ? <Text style={styles.action}>{t("orders.actionNeeded")}</Text> : null}
          <Text style={styles.count}>{t("orders.itemCount", { count: orderItemCount(order) })}</Text>
        </View>
      </View>
    </Card>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    card: { gap: 10 },
    topRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    iconTile: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    headTexts: { flex: 1, minWidth: 0 },
    orderId: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    meta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 2 },
    amount: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
    items: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.sec },
    bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
    bottomRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    action: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.brand },
    count: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.muted },
  });
