import React from "react";
import { Text, View } from "react-native";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { styles } from "../profile-tab.styles";

/** Placeholder card while the profile loads. */
export function ProfileLoadingCard() {
  return <SkeletonCard style={styles.loadingCard} />;
}

/** Placeholder card when the profile could not be loaded. */
export function ProfileUnavailableCard({ message }: { message: string }) {
  return (
    <View style={styles.loadingCard}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}
