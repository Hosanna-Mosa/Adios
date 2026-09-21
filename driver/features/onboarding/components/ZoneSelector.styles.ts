import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

/** Values lifted verbatim from the inline styles on the zone step. */
export const zoneSelectorStyles = StyleSheet.create({
  wrap: { gap: 12, paddingBottom: 10 },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.white,
    maxHeight: 180,
    overflow: "hidden",
    marginTop: -4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 999,
  },
  scroll: { maxHeight: 180 },
  empty: { padding: 12, fontSize: typography.sizes.medium, color: Colors.textMuted, textAlign: "center" },
  row: { padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.neutral100 },
  rowText: { fontSize: typography.sizes.medium, color: Colors.neutral800, fontWeight: "600" },

  selectedWrap: { marginTop: 12 },
  selectedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.infoSurface,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedLabel: { fontSize: typography.sizes.small, fontWeight: "600", color: Colors.textMuted, marginBottom: 6 },
  selectedIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.infoBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCopy: { flex: 1 },
  selectedName: { fontSize: typography.sizes.large, fontWeight: "700", color: Colors.infoDark },
  selectedDesc: { fontSize: typography.sizes.small, color: Colors.infoMid, marginTop: 2 },
  selectedLink: { fontSize: typography.sizes.small, fontWeight: "700", color: Colors.primary, marginTop: 8 },
});
