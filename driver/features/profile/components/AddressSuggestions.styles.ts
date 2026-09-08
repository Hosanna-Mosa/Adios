import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export const suggestionStyles = StyleSheet.create({
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    maxHeight: 180,
    overflow: "hidden",
    marginTop: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 999,
  },
  scroll: { maxHeight: 180 },
  row: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
  },
  name: { fontSize: 14, color: Colors.text, fontWeight: "600" },
  address: { fontSize: 12, color: Colors.textSecondary },
});
