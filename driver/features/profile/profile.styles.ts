import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

/** Merged from the part files that used to sit beside this one: they were
 *  split only to satisfy a 150-line cap, and re-spread here at runtime. */
export const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageTitle: {
    fontSize: typography.sizes.extraLarge,
    fontWeight: "800",
    color: Colors.text,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: typography.sizes.extraLarge,
    fontWeight: "800",
    color: Colors.white,
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  profileName: {
    fontSize: typography.sizes.large,
    fontWeight: "700",
    color: Colors.text,
  },
  profilePhone: {
    fontSize: typography.sizes.medium,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: typography.sizes.small,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: typography.sizes.extraLarge,
    fontWeight: "800",
    color: Colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.small,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  earningsSummary: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  earningsItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  earningsItemLabel: {
    flex: 1,
    fontSize: typography.sizes.medium,
    color: Colors.text,
    fontWeight: "500",
  },
  earningsItemValue: {
    fontSize: typography.sizes.large,
    fontWeight: "700",
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.primary + "22",
  },
  menuSection: {
    gap: 10,
  },
  menuSectionTitle: {
    fontSize: typography.sizes.medium,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingLeft: 4,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.sizes.medium,
    fontWeight: "500",
    color: Colors.text,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 68,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.errorLight,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.error + "30",
  },
  logoutText: {
    fontSize: typography.sizes.large,
    fontWeight: "700",
    color: Colors.error,
  },
  versionText: {
    textAlign: "center",
    fontSize: typography.sizes.small,
    color: Colors.textMuted,
    fontWeight: "500",
  },
});
