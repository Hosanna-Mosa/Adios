import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { Button } from "@/components/ui/Button";

// Moved out of app/(tabs)/orders.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  orders: any;
  styles: any;
  tokens: any;
}

export function OrdersEmptyWrap({
  orders,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.emptyWrap} entering={fadeInUp(0)}>
      <View style={styles.emptyIconCircle}><Ionicons name="receipt-outline" size={moderateScale(28)} color={tokens.brand} /></View>
      <Text style={styles.emptyTitle}>{t("app.orders.noOrdersYet")}</Text>
      <Text style={styles.emptySubtitle}>{t("app.orders.foodMeatRidesHelpersAndCourier")}</Text>
      <Button title={t("app.orders.exploreFlavour")} onPress={() => router.replace("/(tabs)")} fullWidth />
    </Animated.View>
  );
}
