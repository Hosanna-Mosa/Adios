import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

/** Values lifted verbatim from the inline styles on the helper task stage. */
export const helperTaskStyles = StyleSheet.create({
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    alignSelf: "center",
  },
  timerText: { fontSize: typography.sizes.extraLarge, fontWeight: "900", marginLeft: 8 },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
    flexDirection: "row",
  },
  progressRest: { backgroundColor: "transparent" },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  progressLabel: { fontSize: typography.sizes.small, color: Colors.textSecondary, fontWeight: "600" },
  updatesHeading: {
    fontSize: typography.sizes.small,
    color: Colors.textSecondary,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  updatesScroll: { marginBottom: 20 },
  updateChip: {
    backgroundColor: Colors.brandSkin,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  updateChipText: { color: Colors.brand, fontSize: typography.sizes.medium, fontWeight: "600" },
});
