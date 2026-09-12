import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

export const validationErrorStyles = StyleSheet.create({
  // values lifted verbatim from the three inline copies on identity-verify
  box: {
    backgroundColor: Colors.dangerSurface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
  },
  text: {
    color: Colors.error,
    fontSize: typography.sizes.medium,
    lineHeight: typography.lineHeights.medium,
  },
});
