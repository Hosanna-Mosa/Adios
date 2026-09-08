import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../saved-addresses.styles";

/** Shown when the driver has not saved any address yet. */
export function NoAddressesState() {
  return (
    <View style={styles.emptyState}>
      <Feather name="map" size={48} color={Colors.border} />
      <Text style={styles.emptyText}>No saved addresses yet</Text>
    </View>
  );
}
