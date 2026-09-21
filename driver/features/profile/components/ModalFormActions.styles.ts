import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

/** Lifted verbatim from the profile tab's modalStyles. */
export const modalActionStyles = StyleSheet.create({
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontWeight: "600",
    fontSize: typography.sizes.medium,
    color: Colors.textMuted,
  },
  saveBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontWeight: "700",
    fontSize: typography.sizes.medium,
    color: Colors.white,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  editButtonText: {
    fontWeight: "600",
    fontSize: typography.sizes.medium,
    color: Colors.primary,
  },
});
