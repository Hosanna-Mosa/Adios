import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

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
  title: { fontSize: typography.sizes.medium, fontWeight: "600", color: Colors.success },
  coords: { fontSize: typography.sizes.small, color: Colors.success, marginTop: 2 },
});
