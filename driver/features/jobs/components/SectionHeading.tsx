import React from "react";
import { Text, View } from "react-native";
import { styles } from "../home.styles";

/** "Active Tasks", "Scheduled Rides (2)" — the heading above a home section. */
export function SectionHeading({ title }: { title: React.ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}
