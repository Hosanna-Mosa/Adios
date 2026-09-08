import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export const inputStyles = StyleSheet.create({
  group: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600", color: Colors.text },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
    backgroundColor: Colors.surface,
  },
  input: { flex: 1, fontSize: 16, color: Colors.text },
});
