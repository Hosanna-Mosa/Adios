import React from "react";
import { staggerListItem } from "@/motion/presets";
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { StatusBarFill } from "@/components/StatusBarFill";
import Animated from "react-native-reanimated";
import { typography } from "@/constants/typography";

// Moved out of app/ride-confirmation.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  ENABLED_TIERS: any[];
  accent: any;
  booking: any;
  dateOptions: any[];
  insets: any;
  placeOrder: any;
  reserveAmpm: any;
  reserveDate: any;
  reserveHour: any;
  reserveMinute: any;
  selectedFare: any;
  selectedTier: any;
  setReserveAmpm: React.Dispatch<React.SetStateAction<any>>;
  setReserveDate: React.Dispatch<React.SetStateAction<any>>;
  setReserveHour: React.Dispatch<React.SetStateAction<any>>;
  setReserveMinute: React.Dispatch<React.SetStateAction<any>>;
  setShowDatePicker: React.Dispatch<React.SetStateAction<any>>;
  showDatePicker: any;
  styles: any;
}

export function SchedulePickerSheet({
  ENABLED_TIERS,
  accent,
  booking,
  dateOptions,
  insets,
  placeOrder,
  reserveAmpm,
  reserveDate,
  reserveHour,
  reserveMinute,
  selectedFare,
  selectedTier,
  setReserveAmpm,
  setReserveDate,
  setReserveHour,
  setReserveMinute,
  setShowDatePicker,
  showDatePicker,
  styles,
}: Props) {
  return (
    <Modal statusBarTranslucent visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
      <StatusBarFill />
      <View style={styles.sheetOverlay}>
        <TouchableOpacity activeOpacity={1} style={styles.sheetScrim} onPress={() => setShowDatePicker(false)} />
        <View style={[styles.datePickerSheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.datePickerTitle}>Schedule a ride</Text>
          <Text style={styles.datePickerSub}>We&apos;ll assign a captain 15 minutes before pickup.</Text>

          <Text style={styles.pickerLabel}>Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 20 }}>
            {dateOptions.map((date, idx) => {
              const isSelected = reserveDate.toDateString() === date.toDateString();
              const dayName = idx === 0 ? "Today" : date.toLocaleDateString([], { weekday: "short" });
              return (
                <Animated.View key={idx} entering={staggerListItem(idx, 30)}>
                  <TouchableOpacity style={[styles.dateCard, isSelected && { borderColor: accent.accent, backgroundColor: accent.skin }]} onPress={() => setReserveDate(date)}>
                    <Text style={[styles.dateCardDay, isSelected && { color: accent.accent }]}>{dayName}</Text>
                    <Text style={[styles.dateCardNum, isSelected && { color: accent.accent }]}>{date.getDate()}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>

          <Text style={styles.pickerLabel}>Pickup time</Text>
          <View style={{ flexDirection: "row", gap: 16, marginBottom: 16 }}>
            <ScrollView style={{ flex: 1 }} horizontal={false} showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {["1","2","3","4","5","6","7","8","9","10","11","12"].map((hr) => (
                  <TouchableOpacity key={hr} style={[styles.timeChip, reserveHour === hr && { backgroundColor: accent.skin, borderColor: accent.accent }]} onPress={() => setReserveHour(hr)}>
                    <Text style={[styles.timeChipText, reserveHour === hr && { color: accent.accent }]}>{hr}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {["00","15","30","45"].map((min) => (
              <TouchableOpacity key={min} style={[styles.timeChip, reserveMinute === min && { backgroundColor: accent.skin, borderColor: accent.accent }]} onPress={() => setReserveMinute(min)}>
                <Text style={[styles.timeChipText, reserveMinute === min && { color: accent.accent }]}>{min}</Text>
              </TouchableOpacity>
            ))}
            {["AM","PM"].map((period) => (
              <TouchableOpacity key={period} style={[styles.timeChip, reserveAmpm === period && { backgroundColor: accent.skin, borderColor: accent.accent }]} onPress={() => setReserveAmpm(period)}>
                <Text style={[styles.timeChipText, reserveAmpm === period && { color: accent.accent }]}>{period}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.scheduleSummaryRow}>
            <View style={styles.tierIconCircle}><Text style={{ fontSize: typography.sizes.large }}>{ENABLED_TIERS.find((t) => t.id === selectedTier)?.icon}</Text></View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.tierName}>{ENABLED_TIERS.find((t) => t.id === selectedTier)?.name}</Text>
              <Text style={styles.tierMeta}>
                {selectedFare ? `Estimated ₹${Math.round(selectedFare.fareBreakdown.total)} · fare confirmed at pickup` : "Estimating fare…"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.confirmScheduleBtn, booking && { opacity: 0.7 }]}
            disabled={booking}
            onPress={() => {
              const finalD = new Date(reserveDate);
              let hr = parseInt(reserveHour, 10);
              if (reserveAmpm === "PM" && hr < 12) hr += 12;
              if (reserveAmpm === "AM" && hr === 12) hr = 0;
              finalD.setHours(hr, parseInt(reserveMinute, 10), 0, 0);
              placeOrder(true, finalD);
            }}
            activeOpacity={0.9}
          >
            {booking ? (
              <ActivityIndicator size="small" color={accent.on} />
            ) : (
              <Text style={styles.confirmScheduleBtnText}>
                Reserve for {reserveDate.toLocaleDateString([], { weekday: "short" })}, {reserveHour}:{reserveMinute} {reserveAmpm}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
