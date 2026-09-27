import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type ServiceTokens } from "@/constants/colors";
import { type DeliveryCheckoutStyles } from "../useDeliveryCheckout";
import { PaymentMethodSelector } from "@/components/shared/PaymentMethodSelector";

// Cash or Online for a package delivery. Online opens Razorpay; cash is collected by the driver.

interface Props {
  styles: DeliveryCheckoutStyles;
  accent: ServiceTokens;
  disabled?: boolean;
}

export function PaymentMethodCard({ styles, accent, disabled }: Props) {
  return (
    <Animated.View style={styles.section} entering={fadeInUp(240)}>
      <PaymentMethodSelector flow="delivery" accent={accent} disabled={disabled} />
    </Animated.View>
  );
}
