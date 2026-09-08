import { StyleSheet } from "react-native";
import { Colors, elevation, radius } from "@/constants/colors";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 20,
    ...elevation.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 12,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginTop: 2,
  },
  earnings: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.success,
  },
  timerContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  timerBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  timerBar: {
    height: "100%",
    backgroundColor: Colors.error,
  },
  timerText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.error,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 16,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.surfaceContainer,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  stopRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  stopLocationName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  stopAddress: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  itemsRestaurantBlock: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  itemsRestaurantName: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  itemRowText: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingLeft: 4,
    paddingVertical: 1,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.successLight,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.successLight,
  },
  paymentText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.success,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
});
