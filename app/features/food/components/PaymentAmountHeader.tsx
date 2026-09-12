import { Text } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type PaymentStyles } from "@/features/food/usePayment.shared";

// Moved out of app/payment.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  getItemCount: any;
  items: any;
  styles: PaymentStyles;
  total: number;
  vendorName: string;
}

export function PaymentAmountHeader({
  getItemCount,
  items,
  styles,
  total,
  vendorName,
}: Props) {
  return (
    <Animated.View entering={fadeInUp(0)} style={styles.payingBlock}>
      <Text style={styles.payingEyebrow}>Paying</Text>
      <Text style={styles.payingAmount}>₹{total}</Text>
      <Text style={styles.payingSub}>{vendorName} · {getItemCount()} items</Text>
    </Animated.View>
  );
}
