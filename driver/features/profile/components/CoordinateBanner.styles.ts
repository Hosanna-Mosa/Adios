import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export const coordinateStyles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.successLight,
    borderWidth: 1.5,
    borderColor: Colors.success,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginTop: 8,
  },
  copy: { flex: 1 },
  title: { fontSize: 13, fontWeight: "600", color: Colors.success },
  coords: { fontSize: 11, color: Colors.success, marginTop: 2 },
});
