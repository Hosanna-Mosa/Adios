import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

export const indicatorStyles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 10, marginBottom: 8 },
  label: { fontSize: typography.sizes.medium, fontWeight: "600", color: Colors.textMuted, letterSpacing: 0.3 },
});
