import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { type DeliveryCheckoutStyles } from "@/features/delivery/useDeliveryCheckout";

// Moved out of app/delivery/checkout.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  styles: DeliveryCheckoutStyles;
  tokens: ThemeTokens;
}

export function PaymentMethodCard({
  styles,
  tokens,
}: Props) {
  return (
    <Animated.View style={styles.section} entering={fadeInUp(240)}>
      <View style={styles.methodRow}>
        <View style={styles.methodIcon}>
          <Ionicons name="card-outline" size={moderateScale(17)} color={tokens.sec} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.methodTitle}>Razorpay</Text>
          <Text style={styles.methodSub}>UPI, cards, wallets — choose on the next step</Text>
        </View>
      </View>
    </Animated.View>
  );
}
