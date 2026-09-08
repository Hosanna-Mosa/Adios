import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export const ticketStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleWrap: { flex: 1, marginRight: 8 },
  title: { fontSize: 15, fontWeight: "800", color: Colors.text },
  meta: { fontSize: 11, fontWeight: "600", color: Colors.textMuted, marginTop: 2 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: "800" },
  preview: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  date: { fontSize: 11, color: Colors.textMuted },
  continue: { fontSize: 12, fontWeight: "bold", color: Colors.primary },
});
