import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { coordinateStyles as styles } from "./CoordinateBanner.styles";

/** Confirmation that an address resolved to map coordinates.
 * Renders nothing until both values are known. */
export function CoordinateBanner({ lat, lng }: { lat: number | null; lng: number | null }) {
  if (lat === null || lng === null) return null;

  return (
    <View style={styles.banner}>
      <Feather name="check-circle" size={18} color={Colors.success} />
      <View style={styles.copy}>
        <Text style={styles.title}>Location Coordinates Resolved</Text>
        <Text style={styles.coords}>
          Coords: [{lng.toFixed(4)}, {lat.toFixed(4)}]
        </Text>
      </View>
    </View>
  );
}
