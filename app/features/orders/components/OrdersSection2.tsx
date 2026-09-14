import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { router } from "expo-router";

// Moved out of app/(tabs)/orders.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  activeStatusCaption: any;
  SERVICE_META: any;
  active: any[];
  styles: any;
  tokens: any;
}

export function OrdersSection2({
  activeStatusCaption,
  SERVICE_META,
  active,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{t("app.orders.activeNow")}</Text>
      {active.map((order, index) => {
        const accent = tokens.services[SERVICE_META[order.__serviceKey]?.accent || "ride"];
        return (
          <Animated.View key={order._id} style={[styles.card, { borderLeftColor: accent.accent, borderLeftWidth: 3, marginBottom: 12 }]} entering={staggerListItem(index)}>
            <View style={styles.liveRow}>
              <Text style={[styles.cardEyebrow, { color: accent.accent }]}>{SERVICE_META[order.__serviceKey]?.label}</Text>
              <View style={styles.liveDot}><View style={[styles.liveDotCore, { backgroundColor: accent.accent }]} /></View>
              <Text style={[styles.liveLabel, { color: accent.accent }]}>{activeStatusCaption(order, order.__serviceKey)}</Text>
            </View>
            <Text style={styles.cardTitle} numberOfLines={1}>{typeof order.vendor === "object" ? order.vendor?.name : order.stops?.[0]?.address || "Order"}</Text>
            <Text style={styles.cardMeta}>₹{Math.round(order.totalPrice || 0)}</Text>
            <TouchableOpacity style={[styles.trackBtn, { backgroundColor: accent.accent }]} onPress={() => router.push({ pathname: "/tracking", params: { orderId: order._id } })}>
              <Text style={[styles.trackBtnText, { color: accent.on }]}>{t("app.orders.trackOrder")}</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}
