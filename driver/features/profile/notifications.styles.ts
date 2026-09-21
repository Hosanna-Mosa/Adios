import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: typography.sizes.large, fontWeight: "600", color: Colors.text },
  markAllText: { fontSize: typography.sizes.medium, fontWeight: "600", color: Colors.primary },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  emptyText: { fontSize: typography.sizes.medium, color: Colors.textSecondary, textAlign: "center", lineHeight: typography.lineHeights.medium },

  row: { flexDirection: "row", gap: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 13 },
  rowUnread: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  rowIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rowTitle: { flex: 0, fontSize: typography.sizes.medium, fontWeight: "600", color: Colors.text },
  rowTitleUnread: { fontWeight: "700" },
  unreadDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  rowBody: { fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: Colors.textSecondary, marginTop: 3 },
  rowTime: { fontSize: typography.sizes.small, fontWeight: "500", color: Colors.textMuted, marginTop: 5 },
});
