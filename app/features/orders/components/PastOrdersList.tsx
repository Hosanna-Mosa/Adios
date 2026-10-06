import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceKey } from "@/constants/colors";
import { type OrdersStyles } from "../orders.styles";
import { RefundNote } from "./RefundNote";
import { OrderThumb } from "./OrderThumb";
import { orderTitle, serviceIcon, shortDate } from "../orderCardHelpers";

interface Props {
  SERVICE_META: Record<string, { label: string; accent: ServiceKey }>;
  RIDE_TYPES: string[];
  handleOpenReviewModal: (order: any) => void;
  handleReorder: (order: any) => void;
  past: any[];
  reorderingId: string | null;
  styles: OrdersStyles;
  tokens: ThemeTokens;
}

/**
 * Finished orders as compact rows in one card: icon, title, "Food · 12 Mar ·
 * ₹240", a status tag, and light actions (reorder, rate / details). Tapping a
 * row opens the receipt (tracking renders the finished-trip view).
 */
export function PastOrdersList({
  SERVICE_META,
  RIDE_TYPES,
  handleOpenReviewModal,
  handleReorder,
  past,
  reorderingId,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{t("app.orders.past")}</Text>
      <View style={styles.listCard}>
        {past.map((order, index) => {
          const meta = SERVICE_META[order.__serviceKey];
          const accent = tokens.services[meta?.accent || "ride"];
          const isRejected = String(order.scheduleStatus || "") === "rejected";
          const isCancelled = String(order.status).toUpperCase() === "CANCELLED" || isRejected;
          const status = String(order.status).toUpperCase();
          const isDelivered = status === "DELIVERED" || status === "COMPLETED";
          const isReordering = reorderingId === order._id;
          const canRate = !isCancelled && isDelivered && !order.isReviewed;
          // A cancelled order has no receipt to open — tracking bounces straight back home.
          const openDetails = isCancelled ? undefined : () => router.push({ pathname: "/tracking", params: { orderId: order._id } });

          const tag = isCancelled
            ? { label: isRejected ? t("app.schedulePill.rejected") : t("app.orders.cancelled"), bg: tokens.errorSkin, fg: tokens.error }
            : isDelivered
              ? {
                  label: status === "DELIVERED" ? t("app.orders.delivered", "Delivered") : t("app.orders.completed", "Completed"),
                  bg: tokens.successSkin,
                  fg: tokens.success,
                }
              : null;

          const reorderLabel = RIDE_TYPES.includes(order.serviceType)
            ? t("app.orders.rebook")
            : order.__serviceKey === "delivery"
              ? t("app.orders.repeatRoute")
              : t("app.food.orderAgain");

          return (
            <Animated.View key={order._id} entering={staggerListItem(index)}>
              {index > 0 && <View style={styles.rowDivider} />}
              <TouchableOpacity style={styles.row} activeOpacity={openDetails ? 0.85 : 1} onPress={openDetails} disabled={!openDetails}>
                <OrderThumb
                  order={order}
                  icon={serviceIcon(order.__serviceKey)}
                  background={isCancelled ? tokens.sunken : accent.skin}
                  color={isCancelled ? tokens.muted : accent.accent}
                  dimmed={isCancelled}
                  styles={styles}
                />

                <View style={styles.titleWrap}>
                  <View style={styles.rowTitleLine}>
                    <Text style={styles.rowTitle} numberOfLines={1}>{orderTitle(order)}</Text>
                    {tag && (
                      <View style={[styles.statusTag, { backgroundColor: tag.bg }]}>
                        <Text style={[styles.statusTagText, { color: tag.fg }]}>{tag.label}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {[meta?.label, shortDate(order.createdAt), `₹${Math.round(order.totalPrice || 0)}`].filter(Boolean).join(" · ")}
                  </Text>

                  <RefundNote order={order} styles={styles} tokens={tokens} />
                  {isRejected && (
                    <Text style={styles.rejectionReason}>
                      {order.scheduleRejectionReason || "The restaurant could not take this order for the requested slot."}
                    </Text>
                  )}

                  <View style={styles.rowActions}>
                    <TouchableOpacity
                      style={styles.rowAction}
                      onPress={() => handleReorder(order)}
                      disabled={isReordering}
                      hitSlop={8}
                    >
                      {isReordering ? (
                        <ActivityIndicator size="small" color={accent.accent} />
                      ) : (
                        <>
                          <Ionicons name="refresh" size={moderateScale(14)} color={accent.accent} />
                          <Text style={[styles.rowActionText, { color: accent.accent }]}>{reorderLabel}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    {canRate ? (
                      <TouchableOpacity style={styles.rowAction} onPress={() => handleOpenReviewModal(order)} hitSlop={8}>
                        <Ionicons name="star-outline" size={moderateScale(14)} color={tokens.sec} />
                        <Text style={styles.rowActionText}>{t("app.orders.rate")}</Text>
                      </TouchableOpacity>
                    ) : openDetails ? (
                      <TouchableOpacity style={styles.rowAction} onPress={openDetails} hitSlop={8}>
                        <Ionicons name="receipt-outline" size={moderateScale(14)} color={tokens.sec} />
                        <Text style={styles.rowActionText}>{t("app.orders.details")}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}
