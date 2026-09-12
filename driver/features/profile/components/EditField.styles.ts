import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

/** Note: `fieldLabel` here is the edit-modal variant (13px / text colour).
 * FieldRow has its own, smaller, muted label — the two must not be merged. */
export const editFieldStyles = StyleSheet.create({
  editFieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontWeight: "600",
    fontSize: typography.sizes.medium,
    color: Colors.text,
    marginBottom: 6,
  },
  editFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
    backgroundColor: Colors.background,
  },
  editInput: {
    flex: 1,
    fontSize: typography.sizes.medium,
    color: Colors.text,
    fontWeight: "500",
  },
});
