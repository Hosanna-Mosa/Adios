import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeRide: {
    backgroundColor: Colors.secondaryLight,
  },
  badgeDelivery: {
    backgroundColor: Colors.primaryLight,
  },
  badgeText: {
    fontWeight: "600",
    fontSize: typography.sizes.small,
    color: Colors.secondary,
  },
  badgeTextDelivery: {
    color: Colors.primaryDark,
  },
  time: {
    fontWeight: "600",
    fontSize: typography.sizes.medium,
    color: Colors.textMuted,
  },
  route: {
    flexDirection: "row",
    marginBottom: 14,
  },
  routeLine: {
    alignItems: "center",
    width: 20,
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotPickup: {
    backgroundColor: Colors.success,
  },
  dotDropoff: {
    backgroundColor: Colors.error,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  lineRide: {
    backgroundColor: Colors.success,
  },
  lineDelivery: {
    backgroundColor: Colors.error,
  },
  addresses: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  addressItem: {
    marginBottom: 12,
  },
  addressLabel: {
    fontWeight: "500",
    fontSize: typography.sizes.small,
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.05,
    marginBottom: 2,
  },
  addressText: {
    fontWeight: "500",
    fontSize: typography.sizes.medium,
    color: Colors.text,
  },
  goButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  goButtonRide: {
    backgroundColor: Colors.secondary,
  },
  goButtonDelivery: {
    backgroundColor: Colors.primary,
  },
  goButtonText: {
    fontWeight: "600",
    fontSize: typography.sizes.medium,
    color: Colors.white,
  },
});
