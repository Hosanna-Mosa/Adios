import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { moderateScale } from "react-native-size-matters";

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
    fontFamily: "Inter_700Bold",
    fontSize: moderateScale(24),
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
    fontFamily: "Inter_500Medium",
    fontSize: moderateScale(13),
    color: Colors.textMuted,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  balanceAmount: {
    fontFamily: "Inter_700Bold",
    fontSize: moderateScale(32),
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
    fontFamily: "Inter_600SemiBold",
    fontSize: moderateScale(12),
    color: Colors.success,
  },
  availableText: {
    fontFamily: "Inter_400Regular",
    fontSize: moderateScale(12),
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
    fontFamily: "Inter_600SemiBold",
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: moderateScale(13),
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
    fontFamily: "Inter_700Bold",
    fontSize: moderateScale(20),
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: moderateScale(12),
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: moderateScale(12),
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: moderateScale(18),
    color: Colors.text,
    marginBottom: 6,
  },
  modalText: {
    fontFamily: "Inter_400Regular",
    fontSize: moderateScale(13),
    color: Colors.textMuted,
    marginBottom: 14,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: moderateScale(10),
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: moderateScale(8),
    backgroundColor: Colors.surfaceContainerLow,
  },
  secondaryButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
  },
  primaryButton: {
    minWidth: 88,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: moderateScale(8),
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: moderateScale(13),
    color: Colors.white,
  },
});
