import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { homeAddressStyles as styles } from "./HomeAddressPicker.styles";

export interface HomeAddressSuggestion {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

/** Place suggestions under the home-address field during onboarding. */
export function HomeAddressSuggestions({
  suggestions,
  onSelect,
}: {
  suggestions: HomeAddressSuggestion[];
  onSelect: (item: HomeAddressSuggestion) => void;
}) {
  if (suggestions.length === 0) return null;

  return (
    <View style={styles.dropdown}>
      <ScrollView nestedScrollEnabled={true} style={styles.scroll}>
        {suggestions.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => onSelect(item)} style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.address}>{item.address}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

/** Confirmation that the typed home address resolved to coordinates. */
export function LocationVerifiedBox({ lat, lng }: { lat: number | null; lng: number | null }) {
  if (lat === null || lng === null) return null;

  return (
    <View style={styles.verifiedBox}>
      <Feather name="check-circle" size={18} color={Colors.successBright} />
      <View style={styles.verifiedCopy}>
        <Text style={styles.verifiedTitle}>Location Verified Geometrically</Text>
        <Text style={styles.verifiedCoords}>
          Coords: [${lng.toFixed(4)}, ${lat.toFixed(4)}]
        </Text>
      </View>
    </View>
  );
}
