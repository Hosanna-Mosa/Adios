import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeIn } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/delivery/checkout.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  insets: any;
  route: any;
  stops: any;
  styles: any;
  tokens: any;
}

export function DeliveryCheckoutHeader({
  insets,
  route,
  stops,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={[styles.header, { paddingTop: insets.top + 6 }]} entering={fadeIn(0)}>
      <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      <View style={{ minWidth: 0 }}>
        <Text style={styles.headerTitle}>{t("app.delivery.reviewRoute")}</Text>
        <Text style={styles.headerSub}>
          {t("app.delivery.stopCount", { count: stops.length })}
          {route?.totalDistance != null ? ` · ${route.totalDistance} km` : ""}
          {route?.estimatedTime != null ? ` · about ${route.estimatedTime} min` : ""}
        </Text>
      </View>
    </Animated.View>
  );
}
