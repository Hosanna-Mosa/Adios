import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

export const styles = StyleSheet.create({
  section: {
    marginTop: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: typography.sizes.medium,
    color: Colors.text,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontWeight: "600",
    fontSize: typography.sizes.medium,
    color: Colors.primary,
  },
  hotspotList: {
    gap: 12,
  },
  hotspotItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eefaff',
    alignItems: "center",
    justifyContent: "center",
  },
  hotspotName: {
    fontWeight: "700",
    fontSize: typography.sizes.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  hotspotCopy: {
    flex: 1,
    minWidth: 0,
  },
  hotspotAddress: {
    fontWeight: "400",
    fontSize: typography.sizes.small,
    color: Colors.textMuted,
  },
  surgeChip: {
    backgroundColor: '#eefaff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d2ebff',
    marginRight: 4,
  },
  surgeChipText: {
    fontWeight: "600",
    fontSize: typography.sizes.small,
    color: Colors.primary,
  },
  loadingItem: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingVertical: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  emptyText: {
    fontFamily: "Inter_500Medium",
    fontSize: typography.sizes.small,
    color: Colors.textMuted,
  },
});
