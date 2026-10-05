import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Animated from "react-native-reanimated";
import { OrderCard } from "@/components/shared/OrderCard";
import { OrderCardSkeleton } from "@/components/shared/OrderCardSkeleton";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { staggerListItem } from "@/motion/presets";
import type { PartnerOrder } from "@/types/models";
import type { DashboardStyles } from "../dashboard.styles";

interface Props {
  orders: PartnerOrder[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  styles: DashboardStyles;
}

/** The five latest orders, with a link to the full list. */
export function RecentOrders({ orders, loading, error, onRetry, styles }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.section}>
      <SectionHeader
        title={t("dashboard.recentOrders")}
        actionLabel={orders.length ? t("actions.seeAll") : undefined}
        onAction={() => router.navigate("/(tabs)/orders")}
      />
      {loading ? (
        <OrderCardSkeleton count={3} />
      ) : orders.length === 0 ? (
        <Card bordered elevationLevel="none" padding={0}>
          {error ? (
            <EmptyState compact icon="cloud-offline-outline" title={t("errors.loadFailed")} subtitle={t("errors.checkConnection")} actionLabel={t("actions.tryAgain")} onAction={onRetry} />
          ) : (
            <EmptyState compact icon="receipt-outline" title={t("dashboard.noOrdersYet")} subtitle={t("dashboard.noOrdersHint")} />
          )}
        </Card>
      ) : (
        <View style={styles.list}>
          {orders.map((order, index) => (
            <Animated.View key={order._id} entering={staggerListItem(index)}>
              <OrderCard order={order} onPress={() => router.push({ pathname: "/order/[id]", params: { id: order._id } })} />
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  );
}
