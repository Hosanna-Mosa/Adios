import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.section} entering={fadeInUp(240)}>
      <View style={styles.methodRow}>
        <View style={styles.methodIcon}>
          <Ionicons name="card-outline" size={moderateScale(17)} color={tokens.sec} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.methodTitle}>{t("app.delivery.razorpay")}</Text>
          <Text style={styles.methodSub}>{t("app.delivery.upiCardsWalletsChooseOnThe")}</Text>
        </View>
      </View>
    </Animated.View>
  );
}
