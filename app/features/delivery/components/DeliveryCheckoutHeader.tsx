import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeIn } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type DeliveryCheckoutStyles } from "@/features/delivery/useDeliveryCheckout";
import type { OrderStop } from "@/types/models";

// Moved out of app/delivery/checkout.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  insets: EdgeInsets;
  route: any;
  stops: OrderStop[];
  styles: DeliveryCheckoutStyles;
  tokens: ThemeTokens;
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
      <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("app.a11y.goBack")}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      {/* flex + one line: a long translated subtitle ran past the screen edge. */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.headerTitle} numberOfLines={1}>{t("app.delivery.reviewRoute")}</Text>
        <Text style={styles.headerSub} numberOfLines={1}>
          {[
            t("app.delivery.stopCount", { count: stops.length }),
            route?.totalDistance != null ? t("app.delivery.distanceKm", { km: route.totalDistance }) : null,
            route?.estimatedTime != null ? t("app.delivery.aboutMinutes", { min: route.estimatedTime }) : null,
          ].filter(Boolean).join(" · ")}
        </Text>
      </View>
    </Animated.View>
  );
}
