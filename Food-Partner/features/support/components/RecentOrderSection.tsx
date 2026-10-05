import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Animated from "react-native-reanimated";
import { OrderCard } from "@/components/shared/OrderCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { fadeInUp } from "@/motion/presets";
import type { PartnerOrder } from "@/types/models";
import { isActive } from "@/utils/orderStatus";
import type { SupportStyles } from "../support.styles";

/** The outlet's latest order — most questions are about one — reusing the shared OrderCard. */
export function RecentOrderSection({ order, styles }: { order?: PartnerOrder; styles: SupportStyles }) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={fadeInUp(60)} style={styles.recent}>
      {order ? (
        <View>
          <SectionHeader title={isActive(order.status) ? t("support.activeOrder") : t("support.latestOrder")} />
          <OrderCard order={order} onPress={() => router.push({ pathname: "/order/[id]", params: { id: order._id } })} />
        </View>
      ) : null}
      <Text style={styles.hint}>{t("support.recentHint")}</Text>
    </Animated.View>
  );
}
