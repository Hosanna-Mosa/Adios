import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "600", color: Colors.text },
  markAllText: { fontSize: 13, fontWeight: "600", color: Colors.primary },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  emptyText: { fontSize: 13, color: Colors.textSecondary, textAlign: "center", lineHeight: 19 },

  row: { flexDirection: "row", gap: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 13 },
  rowUnread: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  rowIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rowTitle: { flex: 0, fontSize: 14, fontWeight: "600", color: Colors.text },
  rowTitleUnread: { fontWeight: "700" },
  unreadDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  rowBody: { fontSize: 13, lineHeight: 18, color: Colors.textSecondary, marginTop: 3 },
  rowTime: { fontSize: 11, fontWeight: "500", color: Colors.textMuted, marginTop: 5 },
});
