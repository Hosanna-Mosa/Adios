import { Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

// Moved out of app/ride-confirmation.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  styles: any;
}

export function RideConfirmFooterActions({
  styles,
}: Props) {
  return (
    <TouchableOpacity style={styles.footerPrimaryBtn} onPress={() => router.replace("/(tabs)/orders")}>
      <Text style={styles.footerPrimaryBtnText}>View my orders</Text>
    </TouchableOpacity>
  );
}
