import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../support.styles";

/** Back arrow and screen title. */
export function SupportHeader({
  title,
  paddingTop,
  onBack,
}: {
  title: string;
  paddingTop: number;
  onBack: () => void;
}) {
  return (
    <View style={[styles.header, { paddingTop }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}
