import React from "react";
import { staggerListItem, modalSlideUp } from "@/motion/presets";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
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
  setSelectedTier,
  setShowDatePicker,
  styles,
  tierFares,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.sheet} entering={modalSlideUp}>
      <View style={styles.sheetHandle} />
      <View style={styles.sheetHeadRow}>
        <Text style={styles.sheetTitle}>{t("app.ride.chooseATrip")}</Text>
        <TouchableOpacity onPress={handleAddStopFromMap}>
          <Text style={styles.addStopLink}>{t("app.ride.addStop")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 8 }}>
          {ENABLED_TIERS.map((tier, i) => {
            const isSelected = selectedTier === tier.id;
            const fare = tierFares[tier.id];
            return (
              <Animated.View key={tier.id} entering={staggerListItem(i)}>
                <TouchableOpacity
                  style={[styles.tierRow, isSelected && styles.tierRowSelected]}
                  onPress={() => setSelectedTier(tier.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.tierIconCircle}><Text style={{ fontSize: typography.sizes.large }}>{tier.icon}</Text></View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.tierName}>{tier.name}</Text>
                    <Text style={styles.tierMeta}>
                      {tier.capacity}{fare ? ` · ${fare.estimatedMinutes} min away` : ""}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    {loadingFares && !fare ? (
                      <ActivityIndicator size="small" color={accent.accent} />
                    ) : (
                      <Text style={styles.tierPrice}>{fare ? `₹${Math.round(fare.fareBreakdown.total)}` : "—"}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.scheduleRow} onPress={() => setShowDatePicker(true)} activeOpacity={0.85}>
          <View style={styles.scheduleIconCircle}><Ionicons name="time-outline" size={16} color={accent.accent} /></View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.scheduleTitle}>{t("app.ride.scheduleARide")}</Text>
            <Text style={styles.scheduleSub}>{t("app.ride.bookUpTo7DaysAhead")}</Text>
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
              <Text style={styles.bookBtnText}>{t("app.ride.book")} {ENABLED_TIERS.find((tier) => tier.id === selectedTier)?.name}</Text>
              {selectedFare && <Text style={styles.bookBtnPrice}>· ₹{Math.round(selectedFare.fareBreakdown.total)}</Text>}
            </>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
