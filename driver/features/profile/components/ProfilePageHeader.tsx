import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../profile.styles";

/** Page title with a close action. */
export function ProfilePageHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <View style={styles.headerRow}>
      <Text style={styles.pageTitle}>{title}</Text>
      <TouchableOpacity style={styles.backBtn} onPress={onClose}>
        <Feather name="x" size={20} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );
}
