import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../saved-addresses.styles";

/** Dashed "Add New Address" affordance at the top of the list. */
export function AddAddressButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.addBtn} onPress={onPress}>
      <View style={styles.addIcon}>
        <Feather name="plus" size={20} color={Colors.primary} />
      </View>
      <Text style={styles.addText}>Add New Address</Text>
    </TouchableOpacity>
  );
}
