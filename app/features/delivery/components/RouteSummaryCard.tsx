import React from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type ThemeTokens } from "@/constants/colors";
import { type DeliveryCheckoutStyles } from "@/features/delivery/useDeliveryCheckout";

// Moved out of app/delivery/checkout.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  route: any;
  stops: { items: any[]; [k: string]: any }[];
  styles: DeliveryCheckoutStyles;
  tokens: ThemeTokens;
}

export function RouteSummaryCard({
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
        // One row per stop (marker + connector beside its own label), so a stop with an
        // extra meta line can't push its dot out of line with its name. The dots and the
        // names used to be laid out in two separate columns that drifted apart.
        <View style={[styles.routeCard, { flexDirection: "column", gap: 0 }]}>
          {[
            { key: "start", marker: <View style={styles.pickupDot} />, body: <Text style={styles.routeStartEnd}>{t("app.delivery.start")}</Text> },
            ...stops.map((stop, i) => ({
              key: String(stop.id ?? i),
              marker: <View style={styles.stopNumber}><Text style={styles.stopNumberText}>{i + 1}</Text></View>,
              body: (
                <>
                  <Text style={styles.stopName} numberOfLines={1}>{stop.storeName || stop.address}</Text>
                  {stop.items && stop.items.length > 0 && (
                    <Text style={styles.stopMeta}>
                      {t("app.food.itemCount", { count: stop.items.length })}
                      {stop.items.some((it) => it.estimatedPrice != null) ? ` · ₹${stop.items.reduce((sum, it) => sum + (it.estimatedPrice || 0) * it.quantity, 0)} ${t("app.delivery.estLower")}` : ""}
                    </Text>
                  )}
                </>
              ),
            })),
            { key: "drop", marker: <View style={styles.dropSquare} />, body: <Text style={styles.routeStartEnd}>{t("app.delivery.drop")}</Text> },
          ].map((row, idx, rows) => {
            const isLast = idx === rows.length - 1;
            return (
              <View key={row.key} style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ width: 18, alignItems: "center", paddingTop: 2 }}>
                  {row.marker}
                  {!isLast && <View style={[styles.railLine, { marginVertical: 4 }]} />}
                </View>
                <View style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 0 : 12 }}>{row.body}</View>
              </View>
            );
          })}
        </View>
      )}
    </Animated.View>
  );
}
