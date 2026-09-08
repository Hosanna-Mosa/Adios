import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../add-address.styles";

/** Back arrow and title for the address form. */
export function AddressScreenHeader({
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
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Feather name="arrow-left" size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}
