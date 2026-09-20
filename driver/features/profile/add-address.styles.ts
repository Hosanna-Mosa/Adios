import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

export const styles = StyleSheet.create({
  // lifted verbatim from the inline styles on the address field header
  fieldHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  locateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locateText: {
    fontSize: typography.sizes.medium,
    fontWeight: "600",
    color: Colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: typography.sizes.medium,
    fontWeight: "700",
    color: Colors.text,
  },
  labelRow: {
    flexDirection: "row",
    gap: 10,
  },
  labelChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
    justifyContent: "center",
  },
  labelChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  labelChipText: {
    fontSize: typography.sizes.medium,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  labelChipTextActive: {
    color: Colors.white,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: typography.sizes.medium,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: typography.sizes.medium,
    color: Colors.text,
    backgroundColor: Colors.background,
    minHeight: 48,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: typography.sizes.large,
    fontWeight: "700",
  },
});
