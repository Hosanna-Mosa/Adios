import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type DeliveryCheckoutStyles } from "@/features/delivery/useDeliveryCheckout";

// Moved out of app/delivery/checkout.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  itemsEstimate: any;
  styles: DeliveryCheckoutStyles;
}

export function StorePaymentEstimate({
  itemsEstimate,
  styles,
}: Props) {
  return (
    <Animated.View style={styles.section} entering={fadeInUp(120)}>
      <Text style={styles.sectionLabel}>Store payment</Text>
      <View style={styles.storePaymentCard}>
        <View style={styles.storePaymentRow}>
          <Text style={styles.storePaymentLabel}>Your estimate for items</Text>
          <Text style={styles.storePaymentValue}>₹{itemsEstimate}</Text>
        </View>
        <Text style={styles.storePaymentNote}>
          The rider pays at each counter and shares the bill photo. Items are verified on-site and the difference is settled after delivery — this amount is not charged now.
        </Text>
      </View>
    </Animated.View>
  );
}
