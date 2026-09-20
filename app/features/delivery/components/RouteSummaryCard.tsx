import React from "react";
import { Text, View } from "react-native";
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
  return (
    <Animated.View style={styles.section} entering={fadeInUp(60)}>
      <Text style={styles.sectionLabel}>Active route</Text>
      {stops.length === 0 ? (
        <View style={styles.emptyStops}>
          <Ionicons name="location-outline" size={20} color={tokens.muted} />
          <Text style={styles.emptyStopsText}>No stops added</Text>
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
            <Text style={styles.routeStartEnd}>Start</Text>
            {stops.map((stop) => (
              <View key={stop.id}>
                <Text style={styles.stopName} numberOfLines={1}>{stop.storeName || stop.address}</Text>
                {stop.items && stop.items.length > 0 && (
                  <Text style={styles.stopMeta}>
                    {stop.items.length} {stop.items.length === 1 ? "item" : "items"}
                    {stop.items.some((i) => i.estimatedPrice != null) ? ` · ₹${stop.items.reduce((s, i) => s + (i.estimatedPrice || 0) * i.quantity, 0)} est.` : ""}
                  </Text>
                )}
              </View>
            ))}
            <Text style={styles.routeStartEnd}>Drop</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}
