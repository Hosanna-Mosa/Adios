import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Colors, elevation, radius } from "@/constants/colors";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  elevationLevel?: "none" | "sm" | "md" | "lg";
  padding?: number;
  bordered?: boolean;
}

/** Surface container with the shared radius/elevation tokens baked in.
 * Mirrors app/components/ui/Card.tsx. */
export function Card({ children, style, elevationLevel = "sm", padding = 16, bordered = false }: Props) {
  return (
    <View
      style={[
        styles.base,
        { padding },
        elevationLevel !== "none" && elevation[elevationLevel],
        bordered && styles.bordered,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: radius.lg,
  },
  bordered: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
