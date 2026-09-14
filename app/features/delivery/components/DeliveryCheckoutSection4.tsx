import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/delivery/checkout.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  styles: any;
  tokens: any;
}

export function DeliveryCheckoutSection4({
  styles,
  tokens,
}: Props) {
  return (
    <Animated.View style={styles.section} entering={fadeInUp(240)}>
      {/* Was "Razorpay / UPI, cards, wallets — choose on the next step" — the
          checkout no longer goes through a gateway at all (see
          useDeliveryCheckout), so that claim was no longer true regardless of
          whether the request happened to succeed. Matches the label the food
          checkout already settled on (PaymentMethodRow). */}
      <View style={styles.methodRow}>
        <View style={styles.methodIcon}>
          <Ionicons name="cash-outline" size={moderateScale(17)} color={tokens.sec} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.methodTitle}>Cash on delivery</Text>
          <Text style={styles.methodSub}>Pay the delivery partner when your order arrives</Text>
        </View>
      </View>
    </Animated.View>
  );
}
