import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

export const fieldRowStyles = StyleSheet.create({
  fieldRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  fieldLabel: {
    fontWeight: "500",
    fontSize: typography.sizes.small,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  fieldValue: {
    fontWeight: "600",
    fontSize: typography.sizes.medium,
    color: Colors.text,
  },
});
