import React from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { fadeInUp } from "@/motion/presets";

// Moved out of app/drop-location.tsx. Each field is now a bordered slot that
// lights up while it has focus — the drop field used to be the only one with a
// border, permanently — and carries a clear button so a wrong address can be
// wiped without selecting the text by hand.

interface Props {
  accent: any;
  drop: any;
  dropRef: any;
  fetchingLocation: any;
  focusedInput: any;
  fieldText: { pickup: string; drop: string };
  clearField: (type: "pickup" | "drop") => void;
  handleCurrentLocation: any;
  handleFieldChange: (type: "pickup" | "drop" | "stop", id?: string) => (text: string) => void;
  handleRemoveStop: any;
  handleSelection: any;
  handleStopSelection: any;
  pickup: any;
  pickupRef: any;
  setFocusedInput: React.Dispatch<React.SetStateAction<any>>;
  stops: any[];
  styles: any;
  tokens: any;
}

const PLACES_QUERY = { key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY, language: "en" };

export function RouteInputCard({
  accent,
  drop,
  dropRef,
  fetchingLocation,
  focusedInput,
  fieldText,
  clearField,
  handleCurrentLocation,
  handleFieldChange,
  handleRemoveStop,
  handleSelection,
  handleStopSelection,
  pickup,
  pickupRef,
  setFocusedInput,
  stops,
  styles,
  tokens,
}: Props) {
  const isFocused = (type: string, id?: string) =>
    focusedInput?.type === type && (id === undefined || focusedInput?.id === id);

  const ClearButton = ({ type }: { type: "pickup" | "drop" }) => (
    <TouchableOpacity
      style={styles.clearFieldBtn}
      onPress={() => clearField(type)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityLabel={`Clear ${type} address`}
    >
      <Ionicons name="close-circle" size={moderateScale(18)} color={tokens.muted} />
    </TouchableOpacity>
  );

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
        <View style={[styles.fieldSlot, isFocused("pickup") && styles.fieldSlotActive]}>
          <Text style={[styles.fieldLabel, isFocused("pickup") && { color: accent.accent }]}>Pickup</Text>
          <GooglePlacesAutocomplete
            ref={pickupRef}
            placeholder="Pickup location"
            onPress={(data, details = null) => handleSelection('pickup', data, details)}
            fetchDetails={true}
            query={PLACES_QUERY}
            textInputProps={{
              onChangeText: handleFieldChange('pickup'),
              onFocus: () => setFocusedInput({ type: 'pickup' }),
              placeholderTextColor: tokens.muted,
            }}
            styles={{ container: { flex: 0, zIndex: 2000 }, textInput: styles.locationInput, listView: { display: 'none' } }}
            enablePoweredByContainer={false}
            debounce={200}
            renderRightButton={() => (
              <View style={styles.fieldActions}>
                {!!fieldText.pickup && <ClearButton type="pickup" />}
                <TouchableOpacity style={styles.currentLocBtn} onPress={handleCurrentLocation} disabled={fetchingLocation}>
                   {fetchingLocation ? (
                     <ActivityIndicator size="small" color={accent.accent} />
                   ) : (
                     <MaterialCommunityIcons name="crosshairs-gps" size={moderateScale(18)} color={accent.accent} />
                   )}
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        {stops.map((stop, index) => (
          <View key={stop.id} style={[styles.fieldSlot, isFocused("stop", stop.id) && styles.fieldSlotActive]}>
            <Text style={[styles.fieldLabel, isFocused("stop", stop.id) && { color: accent.accent }]}>Stop {index + 1}</Text>
            <View style={styles.stopInputRow}>
              <GooglePlacesAutocomplete
                placeholder="Add stop"
                onPress={(data, details = null) => handleStopSelection(stop.id, data, details)}
                fetchDetails={true}
                query={PLACES_QUERY}
                predefinedPlaces={stop.name ? [{
                  description: stop.name,
                  geometry: { location: { lat: stop.lat, lng: stop.lng, latitude: stop.lat, longitude: stop.lng } },
                }] : []}
                textInputProps={{
                  onChangeText: handleFieldChange('stop', stop.id),
                  onFocus: () => setFocusedInput({ type: 'stop', id: stop.id }),
                  placeholderTextColor: tokens.muted,
                }}
                styles={{ container: { flex: 1, zIndex: 1500 - index }, textInput: styles.locationInput, listView: { display: 'none' } }}
                enablePoweredByContainer={false}
                debounce={200}
              />
              <TouchableOpacity style={styles.clearFieldBtn} onPress={() => handleRemoveStop(stop.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={moderateScale(18)} color={tokens.muted} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={[styles.fieldSlot, (isFocused("drop") || !focusedInput) && styles.fieldSlotActive]}>
          <Text style={[styles.fieldLabel, (isFocused("drop") || !focusedInput) && { color: accent.accent }]}>Drop</Text>
          <GooglePlacesAutocomplete
            ref={dropRef}
            placeholder="Search destination"
            onPress={(data, details = null) => handleSelection('drop', data, details)}
            fetchDetails={true}
            query={PLACES_QUERY}
            textInputProps={{
              onChangeText: handleFieldChange('drop'),
              onFocus: () => setFocusedInput({ type: 'drop' }),
              placeholderTextColor: tokens.muted,
            }}
            styles={{ container: { flex: 0 }, textInput: styles.locationInput, listView: { display: 'none' } }}
            enablePoweredByContainer={false}
            debounce={200}
            renderRightButton={() => (fieldText.drop ? <ClearButton type="drop" /> : <View />)}
          />
        </View>
      </View>
    </Animated.View>
  );
}
