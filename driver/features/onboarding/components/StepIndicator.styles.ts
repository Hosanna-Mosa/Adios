import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export const indicatorStyles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 10, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "600", color: Colors.textMuted, letterSpacing: 0.3 },
});
