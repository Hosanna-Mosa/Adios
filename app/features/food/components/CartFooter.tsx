import { Text, TouchableOpacity, View } from "react-native";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type CartStyles } from "@/features/food/cart.styles";

// Moved out of app/cart.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  goToCheckout: any;
  insets: EdgeInsets;
  styles: CartStyles;
  total: number;
}

export function CartFooter({
  goToCheckout,
  insets,
  styles,
  total,
}: Props) {
  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
      <TouchableOpacity style={styles.continueBtn} activeOpacity={0.9} onPress={goToCheckout}>
        <Text style={styles.continueBtnText}>Continue</Text>
        <Text style={styles.continueBtnPrice}>· ₹{total}</Text>
      </TouchableOpacity>
    </View>
  );
}
