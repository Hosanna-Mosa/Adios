import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../support.styles";

/** One way to reach support: icon, label, and how fast it responds. */
export function ContactOptionCard({
  icon,
  label,
  description,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.contactCard} onPress={onPress}>
      <View style={styles.iconWrapper}>
        <Feather name={icon} size={22} color={Colors.primary} />
      </View>
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactDesc}>{description}</Text>
    </TouchableOpacity>
  );
}
