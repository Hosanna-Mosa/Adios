import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

/** Merged from the part files that used to sit beside this one: they were
 *  split only to satisfy a 150-line cap, and re-spread here at runtime. */
export const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  headerTitle: {
    fontWeight: "700",
    fontSize: typography.sizes.extraLarge,
    color: Colors.text,
    marginBottom: 4,
  },
  loadingCard: {
    backgroundColor: Colors.surface,
    borderRadius: moderateScale(12),
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  balanceCard: {
    backgroundColor: Colors.surface,
    borderRadius: moderateScale(12),
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  balanceLabel: {
    fontWeight: "500",
    fontSize: typography.sizes.medium,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  balanceAmount: {
    fontWeight: "700",
    fontSize: typography.sizes.extraLarge,
    color: Colors.text,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.success + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: moderateScale(6),
    gap: 2,
  },
  trendText: {
    fontWeight: "600",
    fontSize: typography.sizes.small,
    color: Colors.success,
  },
  availableText: {
    fontWeight: "400",
    fontSize: typography.sizes.small,
    color: Colors.textMuted,
    marginTop: 8,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: moderateScale(12),
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: typography.sizes.medium,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  emptyText: {
    fontWeight: "400",
    fontSize: typography.sizes.medium,
    color: Colors.textMuted,
    paddingVertical: 12,
  },
  bottomStats: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: moderateScale(12),
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontWeight: "700",
    fontSize: typography.sizes.large,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontWeight: "500",
    fontSize: typography.sizes.small,
    color: Colors.textMuted,
  },
  modalTitle: {
    fontWeight: "700",
    fontSize: typography.sizes.large,
    color: Colors.text,
    marginBottom: 6,
  },
  modalText: {
    fontWeight: "400",
    fontSize: typography.sizes.medium,
    color: Colors.textMuted,
    marginBottom: 14,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
});
