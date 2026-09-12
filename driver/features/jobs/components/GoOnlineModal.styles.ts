import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

/** Merged from the part files that used to sit beside this one: they were
 *  split only to satisfy a 150-line cap, and re-spread here at runtime. */
export const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handleRow: {
    alignItems: "center",
    marginBottom: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  title: {
    fontWeight: "700",
    fontSize: typography.sizes.extraLarge,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontWeight: "400",
    fontSize: typography.sizes.medium,
    color: Colors.textMuted,
    marginBottom: 24,
    lineHeight: typography.lineHeights.medium,
  },
  servicesContainer: {
    gap: 12,
    marginBottom: 24,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  serviceCardActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  serviceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  serviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  serviceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceIconFood: {
    backgroundColor: Colors.primaryLight,
  },
  serviceName: {
    fontWeight: "600",
    fontSize: typography.sizes.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  serviceNameActive: {
    color: Colors.primaryDark,
  },
  serviceDesc: {
    fontWeight: "400",
    fontSize: typography.sizes.small,
    color: Colors.textMuted,
  },
  selectedBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  selectedBadgeText: {
    fontWeight: "600",
    fontSize: typography.sizes.small,
    color: Colors.white,
  },
  errorText: {
    fontWeight: "500",
    fontSize: typography.sizes.medium,
    color: Colors.error,
    textAlign: "center",
    marginBottom: 8,
  },
  actions: {
    gap: 12,
  },

  cancelBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontWeight: "600",
    fontSize: typography.sizes.medium,
    color: Colors.textSecondary,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  successIconWrap: {
    marginBottom: 16,
  },
  successTitle: {
    fontWeight: "700",
    fontSize: typography.sizes.extraLarge,
    color: Colors.text,
    marginBottom: 8,
  },
  successText: {
    fontWeight: "400",
    fontSize: typography.sizes.medium,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: typography.lineHeights.medium,
  },
});
