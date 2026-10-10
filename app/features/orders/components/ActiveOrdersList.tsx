import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceKey } from "@/constants/colors";
import { type OrdersStyles } from "../orders.styles";
import { clockTime, destination, itemCount, liveSteps, outletName, serviceIcon } from "../orderCardHelpers";
import { ActiveOrderSteps } from "./ActiveOrderSteps";
import { OrderThumb } from "./OrderThumb";

interface Props {
  activeStatusCaption: (order: any, serviceKey: string) => string;
  SERVICE_META: Record<string, { label: string; accent: ServiceKey }>;
  active: any[];
  styles: OrdersStyles;
  tokens: ThemeTokens;
}

const RIDE_KEYS = ["bike", "auto", "cab", "cab_prime"];

/** A helper task nobody has started yet lives on the helper screen (raise the price, cancel, start OTP). */
const HELPER_PRE_START = ["CREATED", "SEARCHING_DRIVER", "DRIVER_ASSIGNED"];

/**
 * One card per live order, read top to bottom: what it is (outlet or service,
 * items, when it was placed, price), where it stands (live caption over the same
 * checklist the tracking screen shows), and where it's going, with Track beside it.
 * The whole card opens tracking — or, for a helper task that hasn't started, the helper screen.
 */
export function ActiveOrdersList({ activeStatusCaption, SERVICE_META, active, styles, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{t("app.orders.activeNow")}</Text>
      {active.map((order, index) => {
        const key: string = order.__serviceKey;
        const meta = SERVICE_META[key];
        const accent = tokens.services[meta?.accent || "ride"];
        const isOutlet = key === "food" || key === "meat";
        const opensHelperScreen = key === "helper" && HELPER_PRE_START.includes(String(order.status || "").toUpperCase());
        const openTracking = () =>
          router.push({ pathname: opensHelperScreen ? "/helper-task" : "/tracking", params: { orderId: order._id } });

        const count = isOutlet ? itemCount(order) : 0;
        const placed = clockTime(order.createdAt);
        const subLine = [
          count ? t("app.orders.itemCount", { count }) : meta?.label,
          placed ? t("app.orders.placedAt", { time: placed }) : null,
        ].filter(Boolean).join(" · ");

        const dest = destination(order, key);
        const destLabel = key === "helper"
          ? t("app.orders.taskLocation")
          : RIDE_KEYS.includes(key) ? t("app.orders.dropAt") : t("app.orders.deliveringTo");

        return (
          <Animated.View key={order._id} entering={staggerListItem(index)}>
            <TouchableOpacity style={styles.activeCard} activeOpacity={0.9} onPress={openTracking}>
              <View style={styles.activeTop}>
                <OrderThumb order={order} icon={serviceIcon(key)} background={accent.skin} color={accent.accent} styles={styles} />
                <View style={styles.titleWrap}>
                  <Text style={styles.activeTitle} numberOfLines={1}>{isOutlet ? outletName(order) : meta?.label}</Text>
                  <Text style={styles.activeSub} numberOfLines={1}>{subLine}</Text>
                </View>
                <Text style={styles.activePrice}>₹{Math.round(order.totalPrice || 0)}</Text>
              </View>

              <View style={[styles.liveBox, { backgroundColor: accent.skin }]}>
                <Text style={[styles.liveCaption, { color: accent.accent }]} numberOfLines={1}>
                  {activeStatusCaption(order, key)}
                </Text>
                <ActiveOrderSteps steps={liveSteps(order, key)} accent={accent} tokens={tokens} />
              </View>

              <View style={styles.activeFoot}>
                <Ionicons name={key === "helper" ? "location-outline" : "flag-outline"} size={moderateScale(18)} color={tokens.muted} />
                <View style={styles.titleWrap}>
                  <Text style={styles.footLabel}>{destLabel}</Text>
                  <Text style={styles.footAddress} numberOfLines={1}>{dest || "—"}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.trackPill, { backgroundColor: accent.accent }]}
                  activeOpacity={0.88}
                  onPress={openTracking}
                  accessibilityRole="button"
                >
                  <Ionicons name="navigate" size={moderateScale(15)} color={accent.on} />
                  <Text style={[styles.trackPillText, { color: accent.on }]}>{t("app.orders.trackOrder")}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}
