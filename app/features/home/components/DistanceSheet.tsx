import React from "react";
import { KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type HomeStyles } from "@/features/home/home.styles";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  appliedDistanceKm: any;
  applyDistanceFilter: any;
  clearDistanceFilter: () => void;
  customDistance: any;
  distanceOption: any;
  insets: EdgeInsets;
  isDistanceSheetOpen: boolean;
  setCustomDistance: React.Dispatch<React.SetStateAction<any>>;
  setDistanceOption: React.Dispatch<React.SetStateAction<any>>;
  setIsDistanceSheetOpen: React.Dispatch<React.SetStateAction<any>>;
  styles: HomeStyles;
  tokens: ThemeTokens;
}

export function DistanceSheet({
  appliedDistanceKm,
  applyDistanceFilter,
  clearDistanceFilter,
  customDistance,
  distanceOption,
  insets,
  isDistanceSheetOpen,
  setCustomDistance,
  setDistanceOption,
  setIsDistanceSheetOpen,
  styles,
  tokens,
}: Props) {
  return (
    <Modal visible={isDistanceSheetOpen} transparent animationType="slide" onRequestClose={() => setIsDistanceSheetOpen(false)}>
      <KeyboardAvoidingView style={styles.distanceModalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}>
        <TouchableOpacity style={styles.distanceModalScrim} onPress={() => setIsDistanceSheetOpen(false)} />
        <View style={[styles.distanceSheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.distanceSheetHandle} />
          <View style={styles.distanceSheetHeader}>
            <View>
              <Text style={styles.distanceTitle}>Customize distance</Text>
              <Text style={styles.distanceSubtitle}>{appliedDistanceKm ? `Filtering within ${appliedDistanceKm} km` : "Showing all nearby options"}</Text>
            </View>
            <TouchableOpacity style={styles.distanceCloseBtn} onPress={() => setIsDistanceSheetOpen(false)}>
              <Ionicons name="close" size={moderateScale(18)} color={tokens.text} />
            </TouchableOpacity>
          </View>

          {distanceOption === "custom" && (
            <View style={styles.distanceInputWrap}>
              <Ionicons name="navigate-outline" size={moderateScale(18)} color={tokens.sec} />
              <TextInput
                style={styles.distanceInput}
                value={customDistance}
                onChangeText={(value) => { setDistanceOption("custom"); setCustomDistance(value.replace(/[^0-9.]/g, "")); }}
                placeholder="Enter distance"
                placeholderTextColor={tokens.muted}
                keyboardType="decimal-pad"
                autoFocus
              />
              <Text style={styles.distanceInputUnit}>km</Text>
            </View>
          )}

          <View style={styles.distancePresetRow}>
            {(["1", "3", "5", "10"] as const).map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.distanceChip, distanceOption === option && styles.distanceChipActive]}
                onPress={() => { setDistanceOption(option); setCustomDistance(""); }}
              >
                <Text style={[styles.distanceChipText, distanceOption === option && styles.distanceChipTextActive]}>{option} km</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.distanceChip, distanceOption === "custom" && styles.distanceChipActive]} onPress={() => setDistanceOption("custom")}>
              <Text style={[styles.distanceChipText, distanceOption === "custom" && styles.distanceChipTextActive]}>Custom</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.distanceApplyBtn} onPress={applyDistanceFilter}>
            <Text style={styles.distanceApplyText}>Apply distance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.distanceClearBtn} onPress={clearDistanceFilter}>
            <Text style={styles.distanceClearText}>Clear all filters</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
