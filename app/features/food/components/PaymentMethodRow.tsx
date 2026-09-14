import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/payment.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  styles: any;
  tokens: any;
}

export function PaymentMethodRow({
  styles,
  tokens,
}: Props) {
  return (
    <View style={styles.methodRow}>
      <View style={styles.methodIcon}>
        <Ionicons name="cash-outline" size={moderateScale(18)} color={tokens.sec} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.methodTitle}>Cash on delivery</Text>
        <Text style={styles.methodSub}>Pay the delivery partner when your order arrives</Text>
      </View>
    </View>
  );
}
