import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { styles } from "../profile-tab.styles";

/** Placeholder card while the profile loads. */
export function ProfileLoadingCard() {
  return (
    <View style={styles.loadingCard}>
      <ActivityIndicator size="small" color={Colors.primary} />
    </View>
  );
}

/** Placeholder card when the profile could not be loaded. */
export function ProfileUnavailableCard({ message }: { message: string }) {
  return (
    <View style={styles.loadingCard}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}
