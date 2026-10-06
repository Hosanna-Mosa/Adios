import { StyleSheet } from "react-native";

// Styles for the Orders tab. The cards themselves are components/shared/OrderCard,
// which reads its own colours, so nothing here depends on the theme.
export const createStyles = () =>
  StyleSheet.create({
    segments: { marginHorizontal: 16, marginBottom: 14 },
    skeleton: { paddingHorizontal: 16, paddingTop: 4 },
  });

export type OrdersStyles = ReturnType<typeof createStyles>;
