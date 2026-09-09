import { StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";

// Styles for OrderStatusTimeline.tsx, moved out so the component file stays under 150 lines.
// Values are unchanged.

export const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  singleLineRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primary}08`,
    borderWidth: 1,
    borderColor: `${colors.primary}15`,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  pulseContainer: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseCircle: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.surface,
    zIndex: 2,
  },
  statusLabel: {
    fontSize: typography.sizes.medium,
    fontWeight: "800",
    color: colors.text,
    flex: 1,
  },
  liveBadge: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveBadgeText: {
    color: "#fff",
    fontSize: typography.sizes.small,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
