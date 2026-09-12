import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";

/** Full-screen spinner while a support session loads. */
export function SupportLoading({ message }: { message: string }) {
  return (
    <View style={[styles.center, { backgroundColor: Colors.background }]}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={{ marginTop: 12, color: Colors.textSecondary }}>{message}</Text>
    </View>
  );
}
