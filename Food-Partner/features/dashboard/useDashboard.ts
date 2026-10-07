import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePartnerTabBarHeight } from "@/components/PartnerTabBar";
import { useIsMeatPartner } from "@/contexts/authStore";
import { useTokens } from "@/contexts/themeStore";
import { isInStock, useFoodMenu, useMeatInventory } from "@/queries/menu.queries";
import { ratingOf, reviewCountOf, usePartnerProfile } from "@/queries/profile.queries";
import { useOrderHistory, useScheduledRequests, useVendorOrders } from "@/queries/orders.queries";
import { isToday } from "@/utils/format";
import { isActive, isCancelled, needsAction } from "@/utils/orderStatus";
import { mergeOrders } from "@/utils/orderWindow";
import { createStyles } from "./dashboard.styles";
import { outletStatus } from "./outletStatus";

// Everything the dashboard shows, derived from the same caches the other tabs
// use. The web panel's stats (VendorStatsRow) counted every order ever as
// "Today's orders" and showed a fixed 4.8 rating; these are computed from the
// real orders instead, and the rating — which the backend doesn't expose to
// vendors — is left out rather than faked.

export function useDashboard() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = usePartnerTabBarHeight();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { profile, loaded: profileLoaded, refetch: refetchProfile } = usePartnerProfile();
  const isMeat = useIsMeatPartner();
  const ordersQuery = useVendorOrders();
  // Only the first page: it fills "Recent orders" on a day with few orders so far.
  const history = useOrderHistory();
  const foodMenu = useFoodMenu();
  const meatInventory = useMeatInventory();
  const scheduled = useScheduledRequests();
  const [refreshing, setRefreshing] = useState(false);

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
  const menuItems: { isAvailable?: boolean }[] = (isMeat ? meatInventory.data : foodMenu.data) ?? [];

  const stats = useMemo(() => {
    const today = orders.filter((o) => isToday(o.createdAt));
    const todayRevenue = today.filter((o) => !isCancelled(o.status)).reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    return {
      todayOrders: today.length,
      todayRevenue,
      activeOrders: orders.filter((o) => isActive(o.status)).length,
      needsAction: orders.filter(needsAction).length,
    };
  }, [orders]);

  const inStock = menuItems.filter(isInStock).length;
  const pendingScheduled = (scheduled.data ?? []).filter((r) => r.status === "pending").length;

  const refresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([
      ordersQuery.refetch(),
      history.refetch(),
      refetchProfile(),
      scheduled.refetch(),
      isMeat ? meatInventory.refetch() : foodMenu.refetch(),
    ]);
    setRefreshing(false);
  };

  return {
    insets,
    tabBarHeight,
    tokens,
    styles,
    profile,
    profileLoaded,
    outletBadge: outletStatus(profile, t)?.badge,
    rating: ratingOf(profile),
    reviewCount: reviewCountOf(profile),
    isMeat,
    orders,
    recentOrders: mergeOrders(orders, history.data?.pages[0]).slice(0, 5),
    ordersLoading: ordersQuery.isLoading,
    ordersError: ordersQuery.isError,
    stats,
    inStock,
    menuTotal: menuItems.length,
    pendingScheduled,
    refreshing,
    refresh,
  };
}
