import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../add-address.styles";

/** "Full Address *" label paired with the Use Current Location action. */
export function AddressFieldHeader({
  label,
  fetching,
  onUseCurrentLocation,
}: {
  label: string;
  fetching: boolean;
  onUseCurrentLocation: () => void;
}) {
  return (
    <View style={styles.fieldHeaderRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        onPress={onUseCurrentLocation}
        disabled={fetching}
        style={styles.locateButton}
      >
        {fetching ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Feather name="target" size={16} color={Colors.primary} />
        )}
        <Text style={styles.locateText}>
          {fetching ? "Locating..." : "Use Current Location"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
