import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export const bannerStyles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.primaryLight,
    padding: 14,
    borderRadius: 12,
  },
  text: { fontSize: 13, color: Colors.primaryDark, flex: 1, lineHeight: 18 },
});
