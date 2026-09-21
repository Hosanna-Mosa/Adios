import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

export const selectStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.infoSkinAlt,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapSelected: { backgroundColor: Colors.primary },
  textWrap: { flex: 1 },
  label: { fontSize: typography.sizes.large, fontWeight: "600", color: Colors.text },
  labelSelected: { color: Colors.primaryDark },
  desc: { fontSize: typography.sizes.medium, color: Colors.textMuted, marginTop: 2 },
  descSelected: { color: Colors.primaryDark },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
});
