import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { router } from "expo-router";

// Moved out of app/(tabs)/orders.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  SERVICE_META: any;
  RIDE_TYPES: any;
  handleOpenReviewModal: any;
  handleReorder: any;
  past: any[];
  reorderingId: any;
  styles: any;
  tokens: any;
}

export function OrdersSection3({
  SERVICE_META,
  RIDE_TYPES,
  handleOpenReviewModal,
  handleReorder,
  past,
  reorderingId,
  styles,
  tokens,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Past</Text>
      {past.map((order, index) => {
        const accent = tokens.services[SERVICE_META[order.__serviceKey]?.accent || "ride"];
        const isRejected = String(order.scheduleStatus || "") === "rejected";
        const isCancelled = String(order.status).toUpperCase() === "CANCELLED" || isRejected;
        const isDelivered = ["DELIVERED", "COMPLETED", "delivered", "completed"].includes(order.status);
        const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString([], { day: "numeric", month: "short" }) : "";
        const isReordering = reorderingId === order._id;
        return (
          <Animated.View key={order._id} style={[styles.card, { borderLeftColor: isCancelled ? tokens.borderStrong : accent.accent, borderLeftWidth: 3, marginBottom: 12 }]} entering={staggerListItem(index)}>
            <View style={styles.liveRow}>
              <Text style={[styles.cardEyebrow, { color: isCancelled ? tokens.muted : accent.accent }]}>{SERVICE_META[order.__serviceKey]?.label}</Text>
              {isCancelled ? (
                <View style={styles.cancelledBadge}><Text style={styles.cancelledBadgeText}>{isRejected ? "Rejected" : "Cancelled"}</Text></View>
              ) : (
                <Text style={styles.cardMetaRight}>{dateStr}</Text>
              )}
            </View>
            <Text style={styles.cardTitle} numberOfLines={1}>{typeof order.vendor === "object" ? order.vendor?.name : order.stops?.map((s: any) => s.address).join(" → ") || "Order"}</Text>
            <Text style={styles.cardMeta}>₹{Math.round(order.totalPrice || 0)}{order.__serviceKey === "delivery" ? " delivery" : ""}</Text>
            {isRejected && (
              <Text style={styles.rejectionReason}>
                {order.scheduleRejectionReason || "The restaurant could not take this order for the requested slot."}
              </Text>
            )}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtnFilled, { backgroundColor: accent.skin, borderColor: accent.accent }]}
                onPress={() => handleReorder(order)}
                disabled={isReordering}
              >
                {isReordering ? (
                  <ActivityIndicator size="small" color={accent.accent} />
                ) : (
                  <Text style={[styles.actionBtnFilledText, { color: accent.accent }]}>
                    {RIDE_TYPES.includes(order.serviceType) ? "Rebook" : order.__serviceKey === "delivery" ? "Repeat route" : "Order again"}
                  </Text>
                )}
              </TouchableOpacity>
              {/* A cancelled order has no receipt to open — tracking bounces straight back home. */}
              {!isCancelled && (isDelivered && !order.isReviewed ? (
                <TouchableOpacity style={styles.actionBtnOutline} onPress={() => handleOpenReviewModal(order)}>
                  <Text style={styles.actionBtnOutlineText}>Rate</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.actionBtnOutline} onPress={() => router.push({ pathname: "/tracking", params: { orderId: order._id } })}>
                  <Text style={styles.actionBtnOutlineText}>Receipt</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}
