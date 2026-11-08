import { useTranslation } from "react-i18next";
import { IconButton } from "@/components/ui/IconButton";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ScreenTitle } from "@/components/ui/ScreenTitle";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { OrderList } from "@/features/orders/components/OrderList";
import { useOrders, type OrdersFilter } from "@/features/orders/useOrders";

/** Orders tab: Active / Completed / Cancelled. */
export default function OrdersScreen() {
  const { t } = useTranslation();
  const { insets, tabBarHeight, styles, filter, setFilter, visible, counts, loading, loadingMore, loadMore, error, refreshing, refresh } = useOrders();

  return (
    <ScreenShell style={{ paddingTop: insets.top + 12 }}>
      <ScreenTitle
        title={t("orders.title")}
        right={<IconButton icon="refresh" accessibilityLabel={t("actions.refresh")} onPress={refresh} loading={refreshing} />}
      />
      <SegmentedControl<OrdersFilter>
        value={filter}
        onChange={setFilter}
        style={styles.segments}
        segments={[
          { key: "active", label: t("orders.active"), count: counts.active },
          { key: "completed", label: t("orders.completed") },
          { key: "cancelled", label: t("orders.cancelled") },
        ]}
      />
      <OrderList
        orders={visible}
        filter={filter}
        loading={loading}
        error={error}
        refreshing={refreshing}
        refresh={refresh}
        loadMore={loadMore}
        loadingMore={loadingMore}
        bottomInset={tabBarHeight}
        styles={styles}
      />
    </ScreenShell>
  );
}
