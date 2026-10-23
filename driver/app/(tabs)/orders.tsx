import React, { useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { DriverTabBar, useDriverTabBarHeight } from "@/components/shared/DriverTabBar";
import { Colors } from "@/constants/colors";
import { AppText } from "@/components/ui/AppText";
import { Box } from "@/components/ui/Box";
import { EmptyState } from "@/components/ui/EmptyState";
import { List } from "@/components/ui/List";
import { Refresh } from "@/components/ui/Refresh";
import { Touchable } from "@/components/ui/Touchable";
import { OrderCard, OrdersSkeleton } from "@/features/orders/components";
import { useDriverOrders } from "@/features/orders/hooks/useDriverOrders";
import { styles } from "@/features/orders/orders.styles";
import type { OrderScope } from "@/features/orders/types";
import { dayHeading, groupByDay, type OrderListRow } from "@/features/orders/utils/orderView";

export default function OrdersScreen() {
  const { t, i18n } = useTranslation();
  const tabBarHeight = useDriverTabBarHeight();
  const [scope, setScope] = useState<OrderScope>("ongoing");
  const { orders, isLoading, isRefreshing, isLoadingMore, error, refresh, loadMore } = useDriverOrders(scope);

  // Past jobs get a heading per day ("Today", "Yesterday", "Mon, 12 Oct"); the few live ones don't need it.
  const rows = useMemo<OrderListRow[]>(
    () => (scope === "past" ? groupByDay(orders) : orders.map((order) => ({ kind: "order", key: order._id, order }))),
    [orders, scope],
  );

  const tabs: { key: OrderScope; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "ongoing", label: t("orders.ongoing", { defaultValue: "Ongoing" }), icon: "flash-outline" },
    { key: "past", label: t("orders.past", { defaultValue: "Past" }), icon: "time-outline" },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Box style={styles.headerWrap}>
        <AppText style={styles.headerTitle}>{t("tabs.orders", { defaultValue: "Orders" })}</AppText>
        <AppText style={styles.headerSub}>
          {t("orders.subtitle", { defaultValue: "Your jobs and what they paid" })}
        </AppText>
      </Box>

      <Box style={styles.segment}>
        {tabs.map((tab) => {
          const active = scope === tab.key;
          return (
            <Touchable
              key={tab.key}
              style={[styles.segmentItem, active && styles.segmentItemActive]}
              onPress={() => setScope(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Ionicons name={tab.icon} size={16} color={active ? Colors.brand : Colors.textMuted} />
              <AppText style={[styles.segmentText, active && styles.segmentTextActive]}>{tab.label}</AppText>
            </Touchable>
          );
        })}
      </Box>

      {isLoading ? (
        <Box style={[styles.listContent, { paddingBottom: tabBarHeight }]}>
          <OrdersSkeleton />
        </Box>
      ) : (
        <List
          data={rows}
          keyExtractor={(row) => row.key}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight }]}
          refreshControl={<Refresh refreshing={isRefreshing} onRefresh={refresh} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) =>
            item.kind === "header" ? (
              <AppText style={styles.dayHeading}>{dayHeading(item.date, t, i18n.language)}</AppText>
            ) : (
              <OrderCard
                order={item.order}
                onPress={() => router.push({ pathname: "/order-details", params: { id: item.order._id } })}
              />
            )
          }
          ListHeaderComponent={
            error ? (
              <Touchable style={styles.errorBox} onPress={refresh} accessibilityRole="button">
                <Ionicons name="alert-circle" size={18} color={Colors.error} />
                <AppText style={styles.errorBoxText}>{error}</AppText>
                <Ionicons name="refresh" size={18} color={Colors.error} />
              </Touchable>
            ) : null
          }
          ListEmptyComponent={
            error ? null : (
              <EmptyState
                icon={scope === "ongoing" ? "flash-outline" : "receipt-outline"}
                title={
                  scope === "ongoing"
                    ? t("orders.noOngoing", { defaultValue: "No ongoing orders" })
                    : t("orders.noPast", { defaultValue: "No past orders yet" })
                }
                subtitle={
                  scope === "ongoing"
                    ? t("orders.noOngoingHint", { defaultValue: "Jobs you accept will show up here." })
                    : t("orders.noPastHint", { defaultValue: "Completed and cancelled jobs will show up here." })
                }
              />
            )
          }
          ListFooterComponent={isLoadingMore ? <ActivityIndicator style={styles.footer} color={Colors.brand} /> : null}
        />
      )}

      <DriverTabBar active="orders" />
    </SafeAreaView>
  );
}
