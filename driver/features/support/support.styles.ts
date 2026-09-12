import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 12,
  },
  heroBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  heroBadgeText: {
    color: Colors.primaryDark,
    fontSize: typography.sizes.small,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: typography.sizes.extraLarge,
    fontWeight: "900",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: typography.sizes.medium,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: typography.lineHeights.medium,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: typography.sizes.large,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 16,
  },
  contactGrid: {
    flexDirection: "row",
    gap: 8,
  },
  contactCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 8,
    alignItems: "center",
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: typography.sizes.medium,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
    textAlign: "center",
  },
  contactDesc: {
    fontSize: typography.sizes.small,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  faqList: {
    gap: 12,
  },
  faqCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  faqQuestion: {
    fontSize: typography.sizes.medium,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
    paddingRight: 8,
  },
  faqBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  faqAnswer: {
    fontSize: typography.sizes.small,
    color: Colors.textSecondary,
    lineHeight: typography.lineHeights.small,
    marginTop: 12,
  },
});
