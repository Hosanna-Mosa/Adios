import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export const taskBannerStyles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.successLight,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.successLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  copy: { flex: 1, paddingRight: 10 },
  title: { fontSize: 13, fontWeight: "700", color: Colors.success },
  subtitle: { fontSize: 11, color: Colors.success },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonEnabled: { backgroundColor: Colors.success },
  buttonDisabled: { backgroundColor: Colors.textMuted },
  buttonText: { color: Colors.white, fontSize: 12, fontWeight: "700" },
});
