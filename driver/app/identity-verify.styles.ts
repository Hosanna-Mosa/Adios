import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export const progressStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, marginBottom: 20 },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  barDone: { backgroundColor: Colors.success },
  barActive: { backgroundColor: Colors.primary },
});

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, paddingHorizontal: 20 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  topBarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    justifyContent: "center",
    alignItems: "center",
  },
  skipText: { fontSize: 14, fontWeight: "600", color: Colors.textMuted },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  bottomBar: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
});
