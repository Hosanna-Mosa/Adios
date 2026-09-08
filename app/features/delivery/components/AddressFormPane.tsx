import React from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeIn, fadeInUp, staggerListItem } from "@/motion/presets";

import { moderateScale } from "react-native-size-matters";

// Moved out of app/delivery/add-address.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  PROVIDER_GOOGLE: any;
  PROVIDER_DEFAULT: any;
  MapView: any;
  accent: any;
  addressLine: any;
  completeAddress: any;
  handleSave: any;
  handleUseCurrentLocation: any;
  insets: any;
  instructions: any;
  isEditMode: any;
  isResolvingAddress: any;
  label: any;
  landmark: any;
  latLabel: any;
  lngLabel: any;
  loading: any;
  receiverName: any;
  receiverPhone: any;
  region: any;
  router: any;
  selectedChip: any;
  setAddressLine: React.Dispatch<React.SetStateAction<any>>;
  setCompleteAddress: React.Dispatch<React.SetStateAction<any>>;
  setInstructions: React.Dispatch<React.SetStateAction<any>>;
  setLabel: React.Dispatch<React.SetStateAction<any>>;
  setLandmark: React.Dispatch<React.SetStateAction<any>>;
  setReceiverName: React.Dispatch<React.SetStateAction<any>>;
  setReceiverPhone: React.Dispatch<React.SetStateAction<any>>;
  setSelectedChip: React.Dispatch<React.SetStateAction<any>>;
  setStep: React.Dispatch<React.SetStateAction<any>>;
  shortAddress: any;
  styles: any;
  tokens: any;
}

export function AddressFormPane({
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
  MapView,
  accent,
  addressLine,
  completeAddress,
  handleSave,
  handleUseCurrentLocation,
  insets,
  instructions,
  isEditMode,
  isResolvingAddress,
  label,
  landmark,
  latLabel,
  lngLabel,
  loading,
  receiverName,
  receiverPhone,
  region,
  router,
  selectedChip,
  setAddressLine,
  setCompleteAddress,
  setInstructions,
  setLabel,
  setLandmark,
  setReceiverName,
  setReceiverPhone,
  setSelectedChip,
  setStep,
  shortAddress,
  styles,
  tokens,
}: Props) {
  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[styles.header, { paddingTop: insets.top + 6 }]} entering={fadeIn(0)}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? "Edit address" : "Add address"}</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} keyboardShouldPersistTaps="handled">
        <Animated.View entering={fadeInUp(60)}>
          <TouchableOpacity style={styles.mapPreview} activeOpacity={0.9} onPress={() => setStep(1)}>
            <MapView provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT} style={StyleSheet.absoluteFill} region={region} scrollEnabled={false} zoomEnabled={false} pitchEnabled={false} rotateEnabled={false} />
            <View style={styles.mapPreviewPin}><Ionicons name="location" size={18} color="#fff" /></View>
            <View style={styles.mapPreviewPill}><Text style={styles.mapPreviewPillText} numberOfLines={1}>{isResolvingAddress ? "Confirming location…" : shortAddress || "Location confirmed"}</Text></View>
          </TouchableOpacity>
          <Text style={styles.mapPreviewCoords}>Lat {latLabel}  ·  Lng {lngLabel}</Text>
        </Animated.View>

        <Animated.View style={styles.section} entering={fadeInUp(120)}>
          <Text style={styles.sectionLabel}>Save as</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["Home", "Work", "Other"] as const).map((chip, i) => {
              const isActive = selectedChip === chip;
              return (
                <Animated.View key={chip} entering={staggerListItem(i, 30)} style={{ flex: 1 }}>
                  <TouchableOpacity style={[styles.chip, isActive && { backgroundColor: accent.skin, borderColor: accent.accent }]} onPress={() => setSelectedChip(chip)}>
                    <Text style={[styles.chipText, isActive && { color: accent.accent }]}>{chip}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
          {selectedChip === "Other" && (
            <TextInput style={styles.customLabelInput} placeholder="Custom label (e.g. Friend's house)" placeholderTextColor={tokens.muted} value={label} onChangeText={setLabel} />
          )}
        </Animated.View>

        <Animated.View style={styles.section} entering={fadeInUp(180)}>
          <Text style={styles.fieldLabel}>Street address</Text>
          <View style={styles.fieldRow}>
            <TextInput style={styles.fieldInput} placeholder="Street address" placeholderTextColor={tokens.muted} value={addressLine} onChangeText={setAddressLine} />
            <TouchableOpacity onPress={handleUseCurrentLocation}><Ionicons name="locate-outline" size={17} color={tokens.sec} /></TouchableOpacity>
          </View>
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Apartment / suite / floor · optional</Text>
          <View style={styles.fieldRow}>
            <TextInput style={styles.fieldInput} placeholder="Apartment / suite / floor" placeholderTextColor={tokens.muted} value={completeAddress} onChangeText={setCompleteAddress} />
          </View>
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Landmark · optional</Text>
          <View style={styles.fieldRow}>
            <TextInput style={styles.fieldInput} placeholder="Opposite the blue water tank" placeholderTextColor={tokens.muted} value={landmark} onChangeText={setLandmark} />
          </View>
        </Animated.View>

        <Animated.View style={styles.section} entering={fadeInUp(210)}>
          <Text style={styles.sectionLabel}>Receiver details</Text>
          <Text style={styles.fieldLabel}>Receiver name · optional</Text>
          <View style={styles.fieldRow}>
            <TextInput style={styles.fieldInput} placeholder="Who is receiving this order?" placeholderTextColor={tokens.muted} value={receiverName} onChangeText={setReceiverName} />
          </View>
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Receiver phone · optional</Text>
          <View style={styles.fieldRow}>
            <TextInput
              style={styles.fieldInput}
              placeholder="10-digit mobile number"
              placeholderTextColor={tokens.muted}
              keyboardType="phone-pad"
              maxLength={10}
              value={receiverPhone}
              onChangeText={(text) => setReceiverPhone(text.replace(/\D/g, ""))}
            />
          </View>
          <Text style={styles.fieldHint}>Leave these blank to deliver to your own name and number.</Text>
        </Animated.View>

        <Animated.View style={styles.section} entering={fadeInUp(270)}>
          <Text style={styles.sectionLabel}>Delivery instructions</Text>
          <View style={styles.instructionsBox}>
            <TextInput
              style={styles.instructionsInput}
              placeholder="Gate 2, ask the guard for tower B…"
              placeholderTextColor={tokens.muted}
              multiline
              maxLength={200}
              value={instructions}
              onChangeText={setInstructions}
            />
          </View>
          <Text style={styles.charCounter}>{instructions.length} / 200</Text>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color={accent.on} /> : <Text style={styles.saveBtnText}>{isEditMode ? "Update address" : "Save address"}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}
