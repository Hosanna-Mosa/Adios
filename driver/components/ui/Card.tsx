import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { Colors, elevation, radius } from "@/constants/colors";
import { Box } from "@/components/ui/Box";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  elevationLevel?: "none" | "sm" | "md" | "lg";
  padding?: number;
  bordered?: boolean;
  testID?: string;
}

/** Surface container with the shared radius/elevation tokens baked in.
 * Mirrors app/components/ui/Card.tsx. */
export function Card({ children, style, elevationLevel = "sm", padding = 16, bordered = false, testID }: Props) {
  return (
    <Box
      testID={testID}
      style={[
        styles.base,
        { padding },
        elevationLevel !== "none" && elevation[elevationLevel],
        bordered && styles.bordered,
        style,
      ]}
    >
      {children}
    </Box>
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
