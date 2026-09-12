import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

/** Values lifted verbatim from the inline styles on the onboarding address
 * step. These are NOT the same as the add-address screen's equivalents —
 * that one uses the brand success colours, this one a lighter green set. */
export const homeAddressStyles = StyleSheet.create({
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.white,
    maxHeight: 180,
    overflow: "hidden",
    marginTop: -8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 999,
  },
  scroll: { maxHeight: 180 },
  row: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  name: { fontSize: typography.sizes.medium, color: Colors.neutral800, fontWeight: "600" },
  address: { fontSize: typography.sizes.small, color: Colors.neutral500 },

  verifiedBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.successSkinPale,
    borderWidth: 1.5,
    borderColor: Colors.success,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  verifiedCopy: { flex: 1 },
  verifiedTitle: { fontSize: typography.sizes.medium, fontWeight: "600", color: Colors.successDeep },
  verifiedCoords: { fontSize: typography.sizes.small, color: Colors.successStrong, marginTop: 2 },
});
