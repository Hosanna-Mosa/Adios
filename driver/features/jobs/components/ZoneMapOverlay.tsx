import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../zone-map.styles";

/** Floating card over the map naming the zone being viewed. */
export function ZoneMapOverlay({
  name,
  description,
  onBack,
}: {
  name: string;
  description?: string | null;
  onBack: () => void;
}) {
  return (
    <View style={styles.headerOverlay}>
      <TouchableOpacity style={styles.roundBackBtn} onPress={onBack}>
        <Feather name="arrow-left" size={24} color={Colors.text} />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>{name}</Text>
        <Text style={styles.headerSubtitle} numberOfLines={2}>
          {description || "Operational geofence coverage area."}
        </Text>
      </View>
    </View>
  );
}
