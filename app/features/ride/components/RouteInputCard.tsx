import React from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type DropLocationStyles } from "@/features/ride/drop-location.styles";

// Moved out of app/drop-location.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  accent: ServiceTokens;
  drop: any;
  dropRef: any;
  fetchingLocation: any;
  handleCurrentLocation: () => void;
  handleRemoveStop: any;
  handleSearch: any;
  handleSelection: any;
  handleStopSelection: any;
  pickup: any;
  pickupRef: any;
  setFocusedInput: React.Dispatch<React.SetStateAction<any>>;
  stops: any[];
  styles: DropLocationStyles;
  tokens: ThemeTokens;
}

export function RouteInputCard({
  accent,
  drop,
  dropRef,
  fetchingLocation,
  handleCurrentLocation,
  handleRemoveStop,
  handleSearch,
  handleSelection,
  handleStopSelection,
  pickup,
  pickupRef,
  setFocusedInput,
  stops,
  styles,
  tokens,
}: Props) {
  return (
    <Animated.View entering={fadeInUp(0)} style={styles.inputCard}>
      <View style={styles.dotsContainer}>
        <View style={styles.pickupDot} />
        <View style={styles.dashLine} />
        {stops.map((stop) => (
           <React.Fragment key={stop.id}>
              <View style={styles.markerSlot}>
                 <View style={styles.stopDiamond} />
              </View>
              <View style={styles.dashLine} />
           </React.Fragment>
        ))}
        <View style={styles.dropSquare} />
      </View>

      <View style={styles.inputsContainer}>
        <View style={styles.fieldSlot}>
          <Text style={styles.fieldLabel}>Pickup</Text>
          <GooglePlacesAutocomplete
            ref={pickupRef}
            placeholder="Pickup location"
            onPress={(data, details = null) => handleSelection('pickup', data, details)}
            fetchDetails={true}
            query={{ key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY, language: "en" }}
            textInputProps={{
              onChangeText: (text) => handleSearch(text, 'pickup'),
              onFocus: () => setFocusedInput({ type: 'pickup' }),
              placeholderTextColor: tokens.muted,
            }}
            styles={{ container: { flex: 0, zIndex: 2000 }, textInput: styles.locationInput, listView: { display: 'none' } }}
            enablePoweredByContainer={false}
            debounce={200}
            renderRightButton={() => (
              <TouchableOpacity style={styles.currentLocBtn} onPress={handleCurrentLocation} disabled={fetchingLocation}>
                 {fetchingLocation ? (
                   <ActivityIndicator size="small" color={accent.accent} />
                 ) : (
                   <MaterialCommunityIcons name="crosshairs-gps" size={18} color={accent.accent} />
                 )}
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.divider} />

        {stops.map((stop, index) => (
          <View key={stop.id}>
            <View style={styles.stopInputRow}>
              <GooglePlacesAutocomplete
                placeholder="Add stop"
                onPress={(data, details = null) => handleStopSelection(stop.id, data, details)}
                fetchDetails={true}
                query={{ key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY, language: "en" }}
                predefinedPlaces={stop.name ? [{
                  description: stop.name,
                  geometry: { location: { lat: stop.lat, lng: stop.lng, latitude: stop.lat, longitude: stop.lng } },
                }] : []}
                textInputProps={{
                  onChangeText: (text) => handleSearch(text, 'stop', stop.id),
                  onFocus: () => setFocusedInput({ type: 'stop', id: stop.id }),
                  placeholderTextColor: tokens.muted,
                }}
                styles={{ container: { flex: 1, zIndex: 1500 - index }, textInput: styles.locationInput, listView: { display: 'none' } }}
                enablePoweredByContainer={false}
                debounce={200}
              />
              <View style={styles.stopActions}>
                <TouchableOpacity style={styles.dragBtn}>
                  <Ionicons name="reorder-two-outline" size={18} color={tokens.muted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveStop(stop.id)}>
                  <Ionicons name="close-outline" size={18} color={tokens.muted} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.divider} />
          </View>
        ))}

        <View style={[styles.fieldSlot, styles.dropFieldSlot]}>
          <Text style={[styles.fieldLabel, { color: accent.accent }]}>Drop</Text>
          <GooglePlacesAutocomplete
            ref={dropRef}
            placeholder="Search destination"
            onPress={(data, details = null) => handleSelection('drop', data, details)}
            fetchDetails={true}
            query={{ key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY, language: "en" }}
            textInputProps={{
              onChangeText: (text) => handleSearch(text, 'drop'),
              onFocus: () => setFocusedInput({ type: 'drop' }),
              placeholderTextColor: tokens.muted,
            }}
            styles={{ container: { flex: 0 }, textInput: styles.locationInput, listView: { display: 'none' } }}
            enablePoweredByContainer={false}
            debounce={200}
          />
        </View>
      </View>
    </Animated.View>
  );
}
