import { Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceKey } from "@/constants/colors";
import { type OrdersStyles } from "../orders.styles";
import { orderTitle } from "../orderCardHelpers";
import { OrderThumb } from "./OrderThumb";

interface Props {
  scheduledSlot: (order: any) => Date | null;
  SERVICE_META: Record<string, { label: string; accent: ServiceKey }>;
  SCHEDULE_PILL: Record<string, string>;
  scheduled: any[];
  styles: OrdersStyles;
  tokens: ThemeTokens;
}

/** Upcoming orders as rows: slot time, what it's from, its confirmation state. Tapping opens it. */
export function ScheduledOrdersList({ scheduledSlot, SERVICE_META, SCHEDULE_PILL, scheduled, styles, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{t("app.orders.scheduled")}</Text>
      <View style={styles.listCard}>
        {scheduled.map((order, index) => {
          const meta = SERVICE_META[order.__serviceKey];
          const accent = tokens.services[meta?.accent || "ride"];
          const slot = scheduledSlot(order);
          const scheduleStatus = String(order.scheduleStatus || "");
          const pillLabel = SCHEDULE_PILL[scheduleStatus];
          const tone =
            scheduleStatus === "accepted"
              ? { bg: tokens.successSkin, fg: tokens.success }
              : scheduleStatus === "rejected"
                ? { bg: tokens.errorSkin, fg: tokens.error }
                : { bg: tokens.warningSkin, fg: tokens.warning };

          return (
            <Animated.View key={order._id} entering={staggerListItem(index)}>
              {index > 0 && <View style={styles.rowDivider} />}
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: "/tracking", params: { orderId: order._id } })}
              >
                <OrderThumb order={order} icon="calendar-outline" background={accent.skin} color={accent.accent} styles={styles} />
                <View style={styles.titleWrap}>
                  <View style={styles.rowTitleLine}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {slot
                        ? slot.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                        : t("app.orders.scheduled")}
                    </Text>
                    {!!pillLabel && (
                      <View style={[styles.statusTag, { backgroundColor: tone.bg }]}>
                        <Text style={[styles.statusTagText, { color: tone.fg }]}>{pillLabel}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {[meta?.label, orderTitle(order), `${t("app.orders.est")}${Math.round(order.totalPrice || 0)}`].filter(Boolean).join(" · ")}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={moderateScale(16)} color={tokens.muted} style={styles.rowChevron} />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}
