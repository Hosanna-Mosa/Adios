import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/(tabs)/orders.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  openFilterSheet: any;
  styles: any;
  tokens: any;
}

export function OrdersChip({
  openFilterSheet,
  styles,
  tokens,
}: Props) {
  return (
    <TouchableOpacity style={styles.filterBtn} onPress={openFilterSheet}>
      <Ionicons name="options-outline" size={moderateScale(17)} color={tokens.text} />
    </TouchableOpacity>
  );
}
