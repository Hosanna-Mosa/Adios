import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Animated from "react-native-reanimated";
import { GradientBanner } from "@/components/ui/GradientBanner";
import { fadeInUp } from "@/motion/presets";
import type { DashboardStyles } from "../dashboard.styles";

/** Shown only while orders are waiting for the kitchen — opens the Orders tab. */
export function ActionNeededCard({ count, styles }: { count: number; styles: DashboardStyles }) {
  const { t } = useTranslation();
  if (count <= 0) return null;
  return (
    <Animated.View entering={fadeInUp(60)} style={styles.banner}>
      <GradientBanner
        icon="flame"
        title={t("dashboard.ordersWaiting", { count })}
        subtitle={t("dashboard.ordersWaitingHint")}
        onPress={() => router.navigate("/(tabs)/orders")}
      />
    </Animated.View>
  );
}
