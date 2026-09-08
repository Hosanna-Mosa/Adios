import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

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
    fontSize: 13,
    lineHeight: 18,
  },
});
