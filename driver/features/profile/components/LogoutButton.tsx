import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../profile.styles";

/** Destructive sign-out row at the bottom of the profile. */
export function LogoutButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.logoutButton} onPress={onPress}>
      <Feather name="log-out" size={20} color={Colors.error} />
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
}
