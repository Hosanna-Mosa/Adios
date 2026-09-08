import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../zone-map.styles";

/** Full-screen state shown while the geofence loads. */
export function ZoneMapLoading({ message }: { message: string }) {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={Colors.brand} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

/** Full-screen state when the zone could not be fetched. */
export function ZoneMapError({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.centerContainer}>
      <Feather name="alert-triangle" size={48} color={Colors.error} />
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity style={styles.backButton} onPress={onAction}>
        <Text style={styles.backButtonText}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}
