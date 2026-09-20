import React from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type DropLocationStyles } from "@/features/ride/drop-location.styles";
import { setBookingPreference } from "@/services/users.service";

// Moved out of app/drop-location.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  user: any;
  accent: ServiceTokens;
  bookingFor: any;
  insets: EdgeInsets;
  savingPreference: any;
  setBookingFor: React.Dispatch<React.SetStateAction<any>>;
  setSavingPreference: React.Dispatch<React.SetStateAction<any>>;
  setShowBookingForSheet: React.Dispatch<React.SetStateAction<any>>;
  setSomeoneContact: React.Dispatch<React.SetStateAction<any>>;
  someoneContact: any;
  styles: DropLocationStyles;
  tokens: ThemeTokens;
}

export function BookingForSheet({
  user,
  accent,
  bookingFor,
  insets,
  savingPreference,
  setBookingFor,
  setSavingPreference,
  setShowBookingForSheet,
  setSomeoneContact,
  someoneContact,
  styles,
  tokens,
}: Props) {
  return (
    <View style={styles.sheetOverlay}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.sheetScrim}
        onPress={() => setShowBookingForSheet(false)}
      />
      <View style={[styles.bookingSheet, { paddingBottom: Math.max(insets.bottom, 18) + 6 }]}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Booking ride for</Text>

        <TouchableOpacity style={styles.bookingOption} onPress={() => setBookingFor("myself")} activeOpacity={0.85}>
          <View style={styles.optionLeft}>
            <MaterialCommunityIcons name="account-circle-outline" size={22} color={tokens.text} />
            <Text style={styles.optionText}>Myself</Text>
          </View>
          <View style={[styles.radioOuter, { borderColor: accent.accent }]}>
            {bookingFor === "myself" && <View style={[styles.radioInner, { backgroundColor: accent.accent }]} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bookingOption} onPress={() => setBookingFor("someone_else")} activeOpacity={0.85}>
          <View style={styles.optionLeft}>
            <MaterialCommunityIcons name="account-plus" size={22} color={tokens.text} />
            <Text style={styles.optionText}>Someone else</Text>
          </View>
          <View style={[styles.radioOuter, { borderColor: accent.accent }]}>
            {bookingFor === "someone_else" && <View style={[styles.radioInner, { backgroundColor: accent.accent }]} />}
          </View>
        </TouchableOpacity>

        {bookingFor === "someone_else" && (
          <View style={styles.contactInputWrap}>
            <Text style={styles.contactInputLabel}>Contact number</Text>
            <TextInput
              style={styles.contactInput}
              value={someoneContact}
              onChangeText={(value) => setSomeoneContact(value.replace(/[^0-9+]/g, ""))}
              keyboardType="phone-pad"
              placeholder="Enter rider contact number"
              placeholderTextColor={tokens.muted}
            />
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={tokens.sec} />
          <Text style={styles.infoText}>Contact name won&apos;t be shared with driver</Text>
        </View>

        <TouchableOpacity
          style={[styles.doneButton, { backgroundColor: accent.accent }, savingPreference && { opacity: 0.7 }]}
          onPress={async () => {
            if (bookingFor === "someone_else" && someoneContact.trim().length < 10) {
              Alert.alert("Contact required", "Please enter a valid contact number for the rider.");
              return;
            }
            if (user?.id) {
              try {
                setSavingPreference(true);
                await setBookingPreference({
                    type: bookingFor,
                    contactNumber: bookingFor === "someone_else" ? someoneContact.trim() : undefined,
                  });
              } catch (error: any) {
                Alert.alert("Save failed", error.message || "Could not save booking preference.");
                return;
              } finally {
                setSavingPreference(false);
              }
            }
            setShowBookingForSheet(false);
          }}
          disabled={savingPreference}
          activeOpacity={0.9}
        >
          {savingPreference ? (
            <ActivityIndicator size="small" color={accent.on} />
          ) : (
            <Text style={[styles.doneButtonText, { color: accent.on }]}>Done</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
