import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: Colors.successLight,
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: 14,
    padding: 14,
  },
  noticeIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeCopy: {
    flex: 1,
    gap: 3,
  },
  noticeTitle: {
    fontWeight: "700",
    fontSize: typography.sizes.medium,
    color: Colors.text,
  },
  noticeText: {
    fontWeight: "400",
    fontSize: typography.sizes.medium,
    lineHeight: typography.lineHeights.medium,
    color: Colors.textSecondary,
  },
  card: {
    gap: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontWeight: "600",
    fontSize: typography.sizes.medium,
    color: Colors.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    fontWeight: "500",
    fontSize: typography.sizes.large,
    color: Colors.text,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    flex: 1,
    color: Colors.error,
    fontWeight: "600",
    fontSize: typography.sizes.medium,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontWeight: "700",
    fontSize: typography.sizes.large,
    color: Colors.white,
  },
});
