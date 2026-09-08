import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";

// Moved out of app/finding-driver.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  dropStop: any;
  orderSummary: any;
  pickupStop: any;
  setShowCancelSheet: React.Dispatch<React.SetStateAction<any>>;
  spinStyle: any;
  styles: any;
  tierLabel: any;
}

export function FindingDriverSheet({
  dropStop,
  orderSummary,
  pickupStop,
  setShowCancelSheet,
  spinStyle,
  styles,
  tierLabel,
}: Props) {
  return (
    <View style={styles.sheet}>
      <View style={styles.sheetHandle} />
      <View style={styles.titleRow}>
        <Animated.View style={[styles.spinner, spinStyle]} />
        <Text style={styles.title}>Finding your captain</Text>
      </View>
      <Text style={styles.subtitle}>
        {tierLabel ? `Searching ${tierLabel} nearby. ` : "Searching nearby captains. "}Usually under a minute.
      </Text>

      {(orderSummary.totalPrice != null || pickupStop || dropStop) && (
        <Animated.View entering={fadeInUp(0)} style={styles.routeCard}>
          {orderSummary.totalPrice != null && (
            <View style={styles.routeCardHead}>
              <Text style={styles.routeCardHeadLabel}>Total fare</Text>
              <Text style={styles.routeCardHeadValue}>₹{Math.round(orderSummary.totalPrice)}</Text>
            </View>
          )}
          {(pickupStop || dropStop) && (
            <View style={styles.routeRow}>
              <View style={styles.routeRail}>
                <View style={styles.routePickupDot} />
                <View style={styles.routeLine} />
                <View style={styles.routeDropSquare} />
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 10 }}>
                <Text style={styles.routeAddr} numberOfLines={1}>{pickupStop?.address || ""}</Text>
                <Text style={styles.routeAddr} numberOfLines={1}>{dropStop?.address || ""}</Text>
              </View>
              {(orderSummary.totalDistance != null || orderSummary.duration != null) && (
                <View style={{ alignItems: "flex-end" }}>
                  {orderSummary.totalDistance != null && <Text style={styles.routeMeta}>{orderSummary.totalDistance.toFixed(1)} km</Text>}
                  {orderSummary.duration != null && <Text style={[styles.routeMeta, { marginTop: 12 }]}>{Math.round(orderSummary.duration)} min</Text>}
                </View>
              )}
            </View>
          )}
        </Animated.View>
      )}

      {tierLabel && (
        <View style={styles.searchingChip}>
          <Text style={styles.searchingLabel}>Searching</Text>
          <Text style={styles.searchingValue}>{tierLabel}</Text>
        </View>
      )}

      <View style={{ marginTop: "auto" }}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCancelSheet(true)} activeOpacity={0.85}>
          <Text style={styles.cancelBtnText}>Cancel ride</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
