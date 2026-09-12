import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

/** Merged from the part files that used to sit beside this one: they were
 *  split only to satisfy a 150-line cap, and re-spread here at runtime. */
export const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, paddingHorizontal: 20 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  topBarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    justifyContent: "center",
    alignItems: "center",
  },
  skipText: { fontSize: typography.sizes.medium, fontWeight: "600", color: Colors.textMuted },
  sectionProgress: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
  },
  sectionBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  sectionBarDone: { backgroundColor: Colors.success },
  sectionBarActive: { backgroundColor: Colors.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  bottomBar: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  bottomBarHidden: {
    display: "none",
  },
});

export const dlStyles = StyleSheet.create({

  dateButton: {
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
  dateText: { flex: 1, fontSize: typography.sizes.large, color: Colors.text },
  datePlaceholder: { flex: 1, fontSize: typography.sizes.large, color: Colors.textMuted },
  errorBox: {
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: { color: Colors.error, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium },
});

export const bankStyles = StyleSheet.create({

  wrap: {
    gap: 16,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: Colors.successSkinSoft,
    borderWidth: 1,
    borderColor: Colors.successBorder,
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
    fontSize: typography.sizes.medium,
    fontWeight: "700",
    color: Colors.text,
  },
  noticeText: {
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
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    flex: 1,
    color: Colors.error,
    fontSize: typography.sizes.medium,
    fontWeight: "600",
  },
});

export const selfieSectionStyles = StyleSheet.create({

  viewfinder: {
    width: 220,
    height: 280,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  viewfinderInner: { alignItems: "center", gap: 12, zIndex: 1 },
  viewfinderText: { fontSize: typography.sizes.small, color: Colors.textMuted, textAlign: "center", paddingHorizontal: 20 },
  oval: {
    position: "absolute",
    top: 40,
    left: 30,
    right: 30,
    bottom: 50,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: Colors.primary,
    opacity: 0.3,
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  guidelines: {
    fontSize: typography.sizes.medium,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: typography.lineHeights.medium,
    paddingHorizontal: 20,
  },
});
