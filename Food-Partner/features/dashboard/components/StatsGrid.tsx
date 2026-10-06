import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Animated from "react-native-reanimated";
import { StatCard } from "@/components/ui/StatCard";
import { staggerListItem } from "@/motion/presets";
import { formatCurrency } from "@/utils/format";
import type { DashboardStyles } from "../dashboard.styles";

interface Props {
  todayOrders: number;
  todayRevenue: number;
  activeOrders: number;
  inStock: number;
  menuTotal: number;
  isMeat: boolean;
  styles: DashboardStyles;
}

/** The four headline figures, two by two. Each opens the screen behind its figure. */
export function StatsGrid({ todayOrders, todayRevenue, activeOrders, inStock, menuTotal, isMeat, styles }: Props) {
  const { t } = useTranslation();
  // `at` changes on every tap, so the Orders tab switches segment even if the same card is tapped twice.
  const openOrders = (filter: "active" | "completed") =>
    router.navigate({ pathname: "/(tabs)/orders", params: { filter, at: String(Date.now()) } });

  return (
    <View style={styles.statsGrid}>
      <Animated.View entering={staggerListItem(0)} style={styles.row}>
        <StatCard
          icon="receipt-outline"
          tone="info"
          label={t("dashboard.todaysOrders")}
          value={String(todayOrders)}
          // Today's orders still in progress first; once they're all done, the finished ones.
          onPress={() => openOrders(activeOrders > 0 ? "active" : "completed")}
        />
        <StatCard
          icon="wallet-outline"
          tone="success"
          label={t("dashboard.todaysRevenue")}
          value={formatCurrency(todayRevenue)}
          onPress={() => router.push("/payouts")}
        />
      </Animated.View>
      <Animated.View entering={staggerListItem(1)} style={styles.row}>
        <StatCard
          icon="flame-outline"
          tone="brand"
          label={t("dashboard.activeOrders")}
          value={String(activeOrders)}
          onPress={() => openOrders("active")}
        />
        <StatCard
          icon={isMeat ? "file-tray-stacked-outline" : "restaurant-outline"}
          tone="warning"
          label={isMeat ? t("dashboard.itemsInStock") : t("dashboard.dishesInStock")}
          value={`${inStock}/${menuTotal}`}
          onPress={() => router.navigate(isMeat ? "/(tabs)/inventory" : "/(tabs)/menu")}
        />
      </Animated.View>
    </View>
  );
}
