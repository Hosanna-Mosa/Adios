import { StyleSheet } from "react-native";
import { Colors, radius } from "@/constants/colors";
import { typography } from "@/constants/typography";

/** Lifted verbatim from the inline styles on the decline-reason panel. */
export const declineStyles = StyleSheet.create({
  wrap: { paddingVertical: 10, paddingBottom: 20 },
  heading: { fontSize: typography.sizes.large, fontWeight: "700", color: Colors.text, marginBottom: 16 },
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
  },
  rowText: { fontSize: typography.sizes.large, color: Colors.textSecondary, flex: 1 },
  back: {
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: radius.md,
    alignItems: "center",
  },
});
