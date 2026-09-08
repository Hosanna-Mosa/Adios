import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";

/** Plain back-and-title bar used by the sessions list and the create form. */
export function SupportScreenHeader({
  title,
  paddingTop,
  onBack,
}: {
  title: string;
  paddingTop: number;
  onBack: () => void;
}) {
  return (
    <View style={[styles.header, { paddingTop, borderBottomColor: Colors.border }]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: Colors.text }]}>{title}</Text>
    </View>
  );
}
