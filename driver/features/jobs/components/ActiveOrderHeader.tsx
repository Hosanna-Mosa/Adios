import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../active-order.styles";

/** Back, the job's title for its service type, and the SOS button. */
export function ActiveOrderHeader({
  title,
  onBack,
  onSOS,
}: {
  title: string;
  onBack: () => void;
  onSOS: () => void;
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Feather name="arrow-left" size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      {/* original was [styles.backBtn, {…overrides}] — keep both layers */}
      <TouchableOpacity style={[styles.backBtn, styles.sosBtn]} onPress={onSOS}>
        <Ionicons name="alert-circle" size={18} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}
