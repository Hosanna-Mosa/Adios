import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../payout-setup.styles";

/** Back arrow, centred title, and a spacer that keeps the title centred. */
export function PayoutHeader({
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
      <Pressable style={styles.backButton} onPress={onBack}>
        <Feather name="arrow-left" size={20} color={Colors.text} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.backButton} />
    </View>
  );
}
