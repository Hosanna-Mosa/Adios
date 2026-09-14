import React from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";

// Moved out of app/delivery/checkout.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  route: any;
  stops: { items: any[]; [k: string]: any }[];
  styles: any;
  tokens: any;
}

export function DeliveryCheckoutSection({
  route,
  stops,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.section} entering={fadeInUp(60)}>
      <Text style={styles.sectionLabel}>{t("app.delivery.activeRoute")}</Text>
      {stops.length === 0 ? (
        <View style={styles.emptyStops}>
          <Ionicons name="location-outline" size={20} color={tokens.muted} />
          <Text style={styles.emptyStopsText}>{t("app.delivery.noStopsAdded")}</Text>
        </View>
      ) : (
        <View style={styles.routeCard}>
          <View style={styles.routeRail}>
            <View style={styles.pickupDot} />
            {stops.map((_, i) => (
              <React.Fragment key={i}>
                <View style={styles.railLine} />
                <View style={styles.stopNumber}><Text style={styles.stopNumberText}>{i + 1}</Text></View>
              </React.Fragment>
            ))}
            <View style={styles.railLine} />
            <View style={styles.dropSquare} />
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 12 }}>
            <Text style={styles.routeStartEnd}>{t("app.delivery.start")}</Text>
            {stops.map((stop) => (
              <View key={stop.id}>
                <Text style={styles.stopName} numberOfLines={1}>{stop.storeName || stop.address}</Text>
                {stop.items && stop.items.length > 0 && (
                  <Text style={styles.stopMeta}>
                    {t("app.food.itemCount", { count: stop.items.length })}
                    {stop.items.some((i) => i.estimatedPrice != null) ? ` · ₹${stop.items.reduce((s, i) => s + (i.estimatedPrice || 0) * i.quantity, 0)} ${t("app.delivery.estLower")}` : ""}
                  </Text>
                )}
              </View>
            ))}
            <Text style={styles.routeStartEnd}>{t("app.delivery.drop")}</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}
