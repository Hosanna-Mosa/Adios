import React from "react";
import { modalSlideUp } from "@/motion/presets";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { typography } from "@/constants/typography";

// Moved out of app/ride-confirmation.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  ENABLED_TIERS: any[];
  accent: any;
  booking: any;
  handleAddStopFromMap: any;
  insets: any;
  loadingFares: any;
  placeOrder: any;
  selectedFare: any;
  selectedTier: any;
  setSelectedTier: React.Dispatch<React.SetStateAction<any>>;
  setShowDatePicker: React.Dispatch<React.SetStateAction<any>>;
  styles: any;
  tierFares: any;
  tokens: any;
}

export function TripChooserSheet({
  ENABLED_TIERS,
  accent,
  booking,
  handleAddStopFromMap,
  insets,
  loadingFares,
  placeOrder,
  selectedFare,
  selectedTier,
  setShowDatePicker,
  styles,
  tierFares,
  tokens,
}: Props) {
  // The vehicle (Bike / Auto) is already chosen on the "All services" screen
  // before the customer ever gets here, via serviceId in the route params —
  // see useRideConfirmationInsets. This used to re-present both tiers as a
  // switchable list, making the customer choose a second time. Now it just
  // shows what was already picked; there's nothing to tap here.
  const tier = ENABLED_TIERS.find((t) => t.id === selectedTier);
  const fare = tierFares[selectedTier];

  return (
    <Animated.View style={styles.sheet} entering={modalSlideUp}>
      <View style={styles.sheetHandle} />
      <View style={styles.sheetHeadRow}>
        <Text style={styles.sheetTitle}>Your trip</Text>
        <TouchableOpacity onPress={handleAddStopFromMap}>
          <Text style={styles.addStopLink}>+ Add stop</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 8 }}>
          <View style={[styles.tierRow, styles.tierRowSelected]}>
            <View style={styles.tierIconCircle}><Text style={{ fontSize: typography.sizes.large }}>{tier?.icon}</Text></View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.tierName}>{tier?.name}</Text>
              <Text style={styles.tierMeta}>
                {tier?.capacity}{fare ? ` · ${fare.estimatedMinutes} min away` : ""}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              {loadingFares && !fare ? (
                <ActivityIndicator size="small" color={accent.accent} />
              ) : (
                <Text style={styles.tierPrice}>{fare ? `₹${Math.round(fare.fareBreakdown.total)}` : "—"}</Text>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.scheduleRow} onPress={() => setShowDatePicker(true)} activeOpacity={0.85}>
          <View style={styles.scheduleIconCircle}><Ionicons name="time-outline" size={16} color={accent.accent} /></View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.scheduleTitle}>Schedule a ride</Text>
            <Text style={styles.scheduleSub}>Book up to 7 days ahead</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={tokens.muted} />
        </TouchableOpacity>
        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <TouchableOpacity
          style={[styles.bookBtn, (booking || !selectedFare) && { opacity: 0.6 }]}
          disabled={booking || !selectedFare}
          onPress={() => placeOrder(false)}
          activeOpacity={0.9}
        >
          {booking ? (
            <ActivityIndicator size="small" color={accent.on} />
          ) : (
            <>
              <Text style={styles.bookBtnText}>Book {ENABLED_TIERS.find((t) => t.id === selectedTier)?.name}</Text>
              {selectedFare && <Text style={styles.bookBtnPrice}>· ₹{Math.round(selectedFare.fareBreakdown.total)}</Text>}
            </>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
