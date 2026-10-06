import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { OrderCard } from "@/components/shared/OrderCard";
import { OrderCardSkeleton } from "@/components/shared/OrderCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { RefreshList } from "@/components/ui/RefreshList";
import type { PartnerOrder } from "@/types/models";
import type { OrdersStyles } from "../orders.styles";
import type { OrdersFilter } from "../useOrders";

interface Props {
  orders: PartnerOrder[];
  filter: OrdersFilter;
  loading: boolean;
  error: boolean;
  refreshing: boolean;
  refresh: () => void;
  /** Loads the next page of history as the list nears its end. */
  loadMore: () => void;
  loadingMore: boolean;
  bottomInset: number;
  styles: OrdersStyles;
}

const EMPTY: Record<OrdersFilter, { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }> = {
  active: { title: "orders.emptyActiveTitle", subtitle: "orders.emptyActiveSubtitle", icon: "flame-outline" },
  completed: { title: "orders.emptyCompletedTitle", subtitle: "orders.emptyCompletedSubtitle", icon: "checkmark-done-outline" },
  cancelled: { title: "orders.emptyCancelledTitle", subtitle: "orders.emptyCancelledSubtitle", icon: "close-circle-outline" },
};

/** The orders in the selected group, newest first, with pull-to-refresh and infinite scroll. */
export function OrderList({ orders, filter, loading, error, refreshing, refresh, loadMore, loadingMore, bottomInset, styles }: Props) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <View style={styles.skeleton}>
        <OrderCardSkeleton count={4} />
      </View>
    );
  }
  const empty = EMPTY[filter];
  return (
    <RefreshList
      data={orders}
      keyExtractor={(order) => order._id}
      refreshing={refreshing}
      onRefresh={refresh}
      onEndReached={loadMore}
      ListFooterComponent={loadingMore ? <OrderCardSkeleton count={1} /> : null}
      bottomInset={bottomInset}
      renderItem={(order) => <OrderCard order={order} onPress={() => router.push({ pathname: "/order/[id]", params: { id: order._id } })} />}
      ListEmptyComponent={
        error ? (
          <EmptyState icon="cloud-offline-outline" title={t("errors.loadFailed")} subtitle={t("errors.checkConnection")} actionLabel={t("actions.tryAgain")} onAction={refresh} />
        ) : (
          <EmptyState icon={empty.icon} title={t(empty.title)} subtitle={t(empty.subtitle)} />
        )
      }
    />
  );
}
