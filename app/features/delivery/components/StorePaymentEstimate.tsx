import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.section} entering={fadeInUp(120)}>
      <Text style={styles.sectionLabel}>{t("app.delivery.storePayment")}</Text>
      <View style={styles.storePaymentCard}>
        <View style={styles.storePaymentRow}>
          <Text style={styles.storePaymentLabel}>{t("app.delivery.yourEstimateForItems")}</Text>
          <Text style={styles.storePaymentValue}>₹{itemsEstimate}</Text>
        </View>
        <Text style={styles.storePaymentNote}>
          {t("app.delivery.theRiderPaysAtEachCounter")}
        </Text>
      </View>
    </Animated.View>
  );
}
