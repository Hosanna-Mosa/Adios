import { ActivityIndicator, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceKey } from "@/constants/colors";
import { type OrdersStyles } from "../orders.styles";
import { RefundNote } from "./RefundNote";
import { CardThumb } from "./CardThumb";
import { OrderCardBody } from "./OrderCardBody";
import { StatusPill } from "./StatusPill";
import { InvoiceAction } from "./InvoiceAction";
import { PastFoodOrderCard } from "./PastFoodOrderCard";
import { RideHistoryRequest } from "./RideHistoryRequest";
import { useHiddenOrders } from "../hiddenOrders";
import { dayGroupLabel } from "../orderCardHelpers";

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
 * Finished orders as cards grouped under Today / Yesterday / date headings: picture,
 * details, a status pill, then Reorder · Rate & Review · View Bill. Tapping a card opens
 * the receipt (tracking renders the finished-trip view).
 */
export function PastOrdersList({ RIDE_TYPES, handleOpenReviewModal, handleReorder, past, reorderingId, styles, tokens }: Props) {
  const { t } = useTranslation();
  const { hiddenIds, hideOrder } = useHiddenOrders();
  let lastDay = "";
  return (
    <View>
      <View style={[styles.band, { backgroundColor: tokens.brandSkin }]}>
        <View style={styles.pastIcon}>
          <Ionicons name="time" size={moderateScale(15)} color={tokens.onBrand} />
        </View>
        <Text style={styles.bandText}>{t("app.orders.past")}</Text>
      </View>
      {past.filter((o) => !hiddenIds.includes(String(o._id))).map((order, index) => {
        const key: string = order.__serviceKey;
        const isRide = RIDE_TYPES.includes(order.serviceType);
        const isPackage = key === "packageDelivery" || key === "delivery";
        const isRejected = String(order.scheduleStatus || "") === "rejected";
        const status = String(order.status).toUpperCase();
        const isCancelled = status === "CANCELLED" || isRejected;
        const isDelivered = status === "DELIVERED" || status === "COMPLETED";
        const isReordering = reorderingId === order._id;
        const canRate = !isCancelled && isDelivered && !order.isReviewed;
        // A cancelled order has no receipt to open — tracking bounces straight back home.
        const openDetails = isCancelled ? undefined : () => router.push({ pathname: "/tracking", params: { orderId: order._id } });

        const badge = isCancelled ? (
          <StatusPill label={isRejected ? t("app.schedulePill.rejected") : t("app.orders.cancelled")} color={tokens.error} background={tokens.errorSkin} icon="close" styles={styles} />
        ) : isDelivered ? (
          <StatusPill
            label={status === "DELIVERED" ? t("app.orders.delivered", "Delivered") : t("app.orders.completed", "Completed")}
            color={tokens.success}
            background={tokens.successSkin}
            icon="check"
            styles={styles}
          />
        ) : null;

        const reorderLabel = isRide || key === "helper"
          ? t("app.orders.bookAgain", "Book Again")
          : isPackage
            ? t("app.orders.sendAgain", "Send Again")
            : key === "meat"
              ? t("app.orders.orderAgain", "Order Again")
              : t("app.orders.reorder", "Reorder");
        const rateLabel = isRide
          ? t("app.orders.rateDriver", "Rate Driver")
          : isPackage || key === "helper"
            ? t("app.orders.rateService", "Rate Service")
            : t("app.orders.rateReview", "Rate & Review");
        const viewsInvoice = key === "food" || key === "meat" || isRide;
        const viewLabel = key === "food" || key === "meat"
          ? t("app.orders.viewBill", "View Bill")
          : isRide
            ? t("app.orders.viewReceipt", "View Receipt")
            : t("app.orders.viewDetails", "View Details");

        const day = dayGroupLabel(order.createdAt);
        const showDay = day !== lastDay;
        lastDay = day;

        // Restaurant and meat orders use the receipt-style card: outlet, dishes, how it ended.
        if (key === "food" || key === "meat") {
          return (
            <Animated.View key={order._id} entering={staggerListItem(index)}>
              {showDay && !!day && <Text style={styles.dayLabel}>{day}</Text>}
              <PastFoodOrderCard
                order={order}
                tokens={tokens}
                delivered={isDelivered && !isCancelled}
                cancelled={isCancelled}
                reordering={isReordering}
                onReorder={() => handleReorder(order)}
                onRate={() => handleOpenReviewModal(order)}
                onDelete={() => hideOrder(String(order._id))}
              />
            </Animated.View>
          );
        }

        return (
          <Animated.View key={order._id} entering={staggerListItem(index)}>
            {showDay && !!day && <Text style={styles.dayLabel}>{day}</Text>}
            <TouchableOpacity style={styles.orderCard} activeOpacity={openDetails ? 0.9 : 1} onPress={openDetails} disabled={!openDetails}>
              <View style={styles.orderTop}>
                <CardThumb order={order} serviceKey={key} background={tokens.sunken} styles={styles} />
                <OrderCardBody order={order} serviceKey={key} showWhen badge={badge} styles={styles} tokens={tokens} />
                {openDetails && <Ionicons name="chevron-forward" size={moderateScale(16)} color={tokens.text} style={styles.cardChevron} />}
              </View>

              <RefundNote order={order} styles={styles} tokens={tokens} />
              {isRejected && (
                <Text style={styles.rejectionReason}>
                  {order.scheduleRejectionReason || t("app.orders.slotRejectedFallback")}
                </Text>
              )}

              <View style={styles.cardDivider} />
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.cardAction} onPress={() => handleReorder(order)} disabled={isReordering} hitSlop={8}>
                  {isReordering ? (
                    <ActivityIndicator size="small" color={tokens.brand} />
                  ) : (
                    <>
                      <Ionicons name="refresh" size={moderateScale(16)} color={tokens.brand} />
                      <Text style={styles.cardActionText}>{reorderLabel}</Text>
                    </>
                  )}
                </TouchableOpacity>
                {canRate && (
                  <TouchableOpacity style={styles.cardAction} onPress={() => handleOpenReviewModal(order)} hitSlop={8}>
                    <Ionicons name="star-outline" size={moderateScale(16)} color={tokens.brand} />
                    <Text style={styles.cardActionText}>{rateLabel}</Text>
                  </TouchableOpacity>
                )}
                {isDelivered && !isCancelled && viewsInvoice ? (
                  <InvoiceAction orderId={order._id} label={viewLabel} styles={styles} tokens={tokens} />
                ) : openDetails ? (
                  <TouchableOpacity style={styles.cardAction} onPress={openDetails} hitSlop={8}>
                    <Ionicons name="document-text-outline" size={moderateScale(16)} color={tokens.brand} />
                    <Text style={styles.cardActionText}>{viewLabel}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
      {past.some((o) => RIDE_TYPES.includes(o.serviceType)) && <RideHistoryRequest tokens={tokens} />}
    </View>
  );
}
