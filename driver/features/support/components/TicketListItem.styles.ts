import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

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
  title: { fontSize: typography.sizes.medium, fontWeight: "800", color: Colors.text },
  meta: { fontSize: typography.sizes.small, fontWeight: "600", color: Colors.textMuted, marginTop: 2 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: typography.sizes.small, fontWeight: "800" },
  preview: { fontSize: typography.sizes.medium, color: Colors.textSecondary, marginBottom: 8 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  date: { fontSize: typography.sizes.small, color: Colors.textMuted },
  continue: { fontSize: typography.sizes.small, fontWeight: "bold", color: Colors.primary },
});
