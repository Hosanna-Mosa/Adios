import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type DeliveryCheckoutStyles } from "@/features/delivery/useDeliveryCheckout";
import type { OrderStop } from "@/types/models";
import type { PriceBreakdown } from "@/contexts/delivery.types";

// Moved out of app/delivery/checkout.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  deliveryFee: number | null;
  price: PriceBreakdown | null;
  route: any;
  stopCharges: any;
  stops: OrderStop[];
  styles: DeliveryCheckoutStyles;
}

export function DeliveryChargesCard({
  deliveryFee,
  price,
  route,
  stopCharges,
  stops,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.section} entering={fadeInUp(180)}>
      <Text style={styles.sectionLabel}>{t("app.delivery.deliveryCharges")}</Text>
      <View style={styles.billCard}>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>{t("app.delivery.deliveryFee")}{route?.totalDistance != null ? ` · ${route.totalDistance} km` : ""}</Text>
          <Text style={styles.billValue}>₹{deliveryFee}</Text>
        </View>
        {stopCharges > 0 && (
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>{t("app.delivery.multistopCharge")} {t("app.delivery.stopCount", { count: stops.length })}</Text>
            <Text style={styles.billValue}>₹{stopCharges}</Text>
          </View>
        )}
        <View style={styles.billDivider} />
        <View style={styles.billRow}>
          <Text style={styles.billTotalLabel}>{t("app.delivery.toPayNow")}</Text>
          <Text style={styles.billTotalValue}>₹{price?.total ?? 0}</Text>
        </View>
      </View>
    </Animated.View>
  );
}
