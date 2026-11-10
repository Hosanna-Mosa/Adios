import React from "react";
import { modalSlideUp } from "@/motion/presets";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { typography } from "@/constants/typography";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type RideConfirmationStyles } from "@/features/ride/ride-confirmation.styles";
import { RidePayRow } from "./RidePaymentSheet";

// Moved out of app/ride-confirmation.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  ENABLED_TIERS: any[];
  accent: ServiceTokens;
  booking: any;
  handleAddStopFromMap: () => void;
  insets: EdgeInsets;
  loadingFares: any;
  placeOrder: any;
  selectedFare: any;
  selectedTier: any;
  setSelectedTier: React.Dispatch<React.SetStateAction<any>>;
  setShowDatePicker: React.Dispatch<React.SetStateAction<any>>;
  setSheetHeight: React.Dispatch<React.SetStateAction<number>>;
  styles: RideConfirmationStyles;
  tierFares: any;
  tokens: ThemeTokens;
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
  setSheetHeight,
  styles,
  tierFares,
  tokens,
}: Props) {
  const { t } = useTranslation();
  // The vehicle (Bike / Auto) is already chosen on the "All services" screen
  // before the customer ever gets here, via serviceId in the route params â€”
  // see useRideConfirmationInsets. This used to re-present both tiers as a
  // switchable list, making the customer choose a second time. Now it just
  // shows what was already picked; there's nothing to tap here.
  const tier = ENABLED_TIERS.find((option) => option.id === selectedTier);

  return (
    <Animated.View
      style={styles.sheet}
      entering={modalSlideUp}
      onLayout={(e) => setSheetHeight(Math.round(e.nativeEvent.layout.height))}
    >
      <View style={styles.sheetHandle} />
      <View style={styles.sheetHeadRow}>
        <Text style={styles.sheetTitle}>{t("app.ride.yourTrip")}</Text>
        <TouchableOpacity onPress={handleAddStopFromMap}>
          <Text style={styles.addStopLink}>{t("app.ride.addStop")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 8 }}>
          {ENABLED_TIERS.map((option) => {
            const optionFare = tierFares[option.id];
            const selected = option.id === selectedTier;
            // The quickest trip among the vehicles that have a fare gets the badge.
            const fastest = !!optionFare && ENABLED_TIERS.every((o) => !tierFares[o.id] || tierFares[o.id].estimatedMinutes >= optionFare.estimatedMinutes);
            const dropAt = optionFare ? new Date(Date.now() + optionFare.estimatedMinutes * 60_000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase() : "";
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.tierRow, selected && styles.tierRowSelected]}
                onPress={() => setSelectedTier(option.id)}
                activeOpacity={0.85}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <View style={styles.tierIconCircle}><Text style={{ fontSize: typography.sizes.large }}>{option.icon}</Text></View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={styles.tierName}>{option.name}</Text>
                    {fastest && (
                      <View style={{ backgroundColor: tokens.successSkin, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
                        <Text style={{ fontSize: typography.sizes.small, color: tokens.success }}>{t("app.ride.fastest", "FASTEST")}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.tierMeta}>
                    {option.capacity}{optionFare ? ` · ${t("app.ride.tripMinutes", { min: optionFare.estimatedMinutes, defaultValue: "{{min}} min trip" })} · ${t("app.ride.dropAt", { time: dropAt, defaultValue: "Drop {{time}}" })}` : ""}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  {loadingFares && !optionFare ? (
                    <ActivityIndicator size="small" color={accent.accent} />
                  ) : (
                    <Text style={styles.tierPrice}>{optionFare ? `₹${Math.round(optionFare.fareBreakdown.total)}` : "—"}</Text>
                  )}
                </View>
              </TouchableOpacity>
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
        <RidePayRow total={selectedFare?.fareBreakdown?.total ?? 0} insets={insets} disabled={booking} />
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
              <Text style={styles.bookBtnText}>{t("app.ride.book")} {tier?.name}</Text>
              {selectedFare && <Text style={styles.bookBtnPrice}>· ₹{Math.round(selectedFare.fareBreakdown.total)}</Text>}
            </>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
