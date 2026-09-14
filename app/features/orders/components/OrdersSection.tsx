import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { router } from "expo-router";

// Moved out of app/(tabs)/orders.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  scheduledSlot: any;
  SERVICE_META: any;
  SCHEDULE_PILL: any;
  scheduled: any[];
  styles: any;
  tokens: any;
}

export function OrdersSection({
  scheduledSlot,
  SERVICE_META,
  SCHEDULE_PILL,
  scheduled,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{t("app.orders.scheduled")}</Text>
      {scheduled.map((order, index) => {
        const accent = tokens.services[SERVICE_META[order.__serviceKey]?.accent || "ride"];
        const slot = scheduledSlot(order);
        const scheduleStatus = String(order.scheduleStatus || "");
        const pillLabel = SCHEDULE_PILL[scheduleStatus];
        const isAccepted = scheduleStatus === "accepted";
        return (
          <Animated.View key={order._id} style={[styles.card, { borderLeftColor: accent.accent, borderLeftWidth: 3, marginBottom: 12 }]} entering={staggerListItem(index)}>
            <View style={styles.liveRow}>
              <Text style={[styles.cardEyebrow, { color: accent.accent }]}>{SERVICE_META[order.__serviceKey]?.label} {t("app.orders.scheduledDot")}</Text>
              {!!pillLabel && (
                <View style={[styles.schedulePill, isAccepted && { backgroundColor: tokens.successSkin }]}>
                  <Text style={[styles.schedulePillText, isAccepted && { color: tokens.success }]}>{pillLabel}</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardTitle}>{slot ? slot.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : t("app.orders.scheduled")}</Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              {typeof order.vendor === "object" ? order.vendor?.name : order.stops?.map((s: any) => s.address).join(" → ")}
            </Text>
            <Text style={styles.cardMeta}>{t("app.orders.est")}{Math.round(order.totalPrice || 0)}</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtnOutline} onPress={() => router.push({ pathname: "/tracking", params: { orderId: order._id } })}>
                <Text style={styles.actionBtnOutlineText}>{t("app.orders.view")}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}
