import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp, staggerListItem } from "@/motion/presets";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/helper-task.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  TASK_TYPES: any[];
  accent: any;
  activeField: any;
  calculatedFare: any;
  customHours: any;
  customMinutes: any;
  description: any;
  dropoffLocation: any;
  durationMode: any;
  goToBidding: any;
  handleSearch: any;
  handleUseCurrentLocation: any;
  insets: any;
  isProceedDisabled: any;
  offer: any;
  pickupLocation: any;
  searchResults: any[];
  selectResult: any;
  setActiveField: React.Dispatch<React.SetStateAction<any>>;
  setCustomHours: React.Dispatch<React.SetStateAction<number>>;
  setCustomMinutes: React.Dispatch<React.SetStateAction<number>>;
  setDescription: React.Dispatch<React.SetStateAction<any>>;
  setDurationMode: React.Dispatch<React.SetStateAction<any>>;
  setTaskType: React.Dispatch<React.SetStateAction<any>>;
  styles: any;
  suggestedHigh: any;
  suggestedLow: any;
  taskType: any;
  tokens: any;
}

export function TaskComposeForm({
  TASK_TYPES,
  accent,
  activeField,
  calculatedFare,
  customHours,
  customMinutes,
  description,
  dropoffLocation,
  durationMode,
  goToBidding,
  handleSearch,
  handleUseCurrentLocation,
  insets,
  isProceedDisabled,
  offer,
  pickupLocation,
  searchResults,
  selectResult,
  setActiveField,
  setCustomHours,
  setCustomMinutes,
  setDescription,
  setDurationMode,
  setTaskType,
  styles,
  suggestedHigh,
  suggestedLow,
  taskType,
  tokens,
}: Props) {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
        <Animated.Text style={styles.headline} entering={fadeInUp(0)}>What do you need?</Animated.Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>
          {TASK_TYPES.map((t, i) => {
            const isSelected = taskType === t;
            return (
              <Animated.View key={t} entering={staggerListItem(i, 30)}>
                <TouchableOpacity
                  style={[styles.typeChip, isSelected && { backgroundColor: accent.accent, borderColor: accent.accent }]}
                  onPress={() => setTaskType(isSelected ? null : t)}
                >
                  <Text style={[styles.typeChipText, isSelected && { color: accent.on }]}>{t}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>

        <Animated.View style={styles.section} entering={fadeInUp(80)}>
          <View style={styles.locationCard}>
            <View style={styles.railCol}>
              <View style={styles.pickupDot} />
              <View style={styles.railLine} />
              <View style={styles.dropSquare} />
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 10 }}>
              <View>
                <Text style={styles.fieldLabel}>Where the work starts</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Pickup location"
                    placeholderTextColor={tokens.muted}
                    value={pickupLocation}
                    onChangeText={(t) => handleSearch(t, "pickup")}
                    onFocus={() => setActiveField("pickup")}
                  />
                  <TouchableOpacity onPress={handleUseCurrentLocation}>
                    <Ionicons name="locate" size={moderateScale(18)} color={accent.accent} />
                  </TouchableOpacity>
                </View>
                {activeField === "pickup" && searchResults.length > 0 && (
                  <View style={styles.dropdown}>
                    {searchResults.map((r, i) => (
                      <TouchableOpacity key={r.id || i} style={styles.dropdownRow} onPress={() => selectResult(r)}>
                        <Ionicons name="location-outline" size={15} color={tokens.sec} />
                        <Text style={styles.dropdownText} numberOfLines={1}>{r.description || r.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View style={{ height: 1, backgroundColor: tokens.border }} />
              <View>
                <Text style={styles.fieldLabel}>Where it ends</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Drop-off (optional)"
                    placeholderTextColor={tokens.muted}
                    value={dropoffLocation}
                    onChangeText={(t) => handleSearch(t, "dropoff")}
                    onFocus={() => setActiveField("dropoff")}
                  />
                </View>
                {activeField === "dropoff" && searchResults.length > 0 && (
                  <View style={styles.dropdown}>
                    {searchResults.map((r, i) => (
                      <TouchableOpacity key={r.id || i} style={styles.dropdownRow} onPress={() => selectResult(r)}>
                        <Ionicons name="location-outline" size={15} color={tokens.sec} />
                        <Text style={styles.dropdownText} numberOfLines={1}>{r.description || r.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={styles.section} entering={fadeInUp(140)}>
          <Text style={styles.sectionLabel}>Time required</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={styles.timeStepper}>
              <TouchableOpacity onPress={() => { setDurationMode("custom"); setCustomHours((h) => Math.max(0, h - 1)); }}>
                <Text style={styles.stepperSign}>−</Text>
              </TouchableOpacity>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.stepperValue}>{durationMode === "1hr" ? 1 : durationMode === "2hr" ? 2 : customHours}</Text>
                <Text style={styles.stepperUnit}>hours</Text>
              </View>
              <TouchableOpacity onPress={() => { setDurationMode("custom"); setCustomHours((h) => h + 1); }}>
                <Text style={styles.stepperSign}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timeStepper}>
              <TouchableOpacity onPress={() => { setDurationMode("custom"); setCustomMinutes((m) => (m === 0 ? 45 : m - 15)); }}>
                <Text style={styles.stepperSign}>−</Text>
              </TouchableOpacity>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.stepperValue}>{durationMode === "1hr" ? 0 : durationMode === "2hr" ? 0 : customMinutes}</Text>
                <Text style={styles.stepperUnit}>minutes</Text>
              </View>
              <TouchableOpacity onPress={() => { setDurationMode("custom"); setCustomMinutes((m) => (m === 45 ? 0 : m + 15)); }}>
                <Text style={styles.stepperSign}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={styles.section} entering={fadeInUp(200)}>
          <Text style={styles.sectionLabel}>Task description</Text>
          <View style={styles.descBox}>
            <TextInput
              style={styles.descInput}
              placeholder="Two people to carry a 3-seater sofa and 4 cartons down from the 4th floor. No lift after 8 PM."
              placeholderTextColor={tokens.muted}
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>
          <Text style={styles.descHint}>Helpers see this before they bid. Mention stairs, weight and anything heavy.</Text>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        {calculatedFare > 0 && (
          <View style={styles.suggestedRow}>
            <Text style={styles.suggestedLabel}>Suggested offer</Text>
            <Text style={styles.suggestedValue}>₹{suggestedLow} – ₹{suggestedHigh}</Text>
          </View>
        )}
        <TouchableOpacity style={[styles.primaryBtn, isProceedDisabled && { opacity: 0.5 }]} disabled={isProceedDisabled} onPress={goToBidding}>
          <Text style={styles.primaryBtnText}>Set your offer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
