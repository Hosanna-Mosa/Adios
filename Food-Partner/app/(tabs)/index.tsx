import { ScreenShell } from "@/components/ui/ScreenShell";
import { ActionNeededCard } from "@/features/dashboard/components/ActionNeededCard";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { NotificationsOffCard } from "@/features/dashboard/components/NotificationsOffCard";
import { OutletStatusCard } from "@/features/dashboard/components/OutletStatusCard";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { RecentOrders } from "@/features/dashboard/components/RecentOrders";
import { StatsGrid } from "@/features/dashboard/components/StatsGrid";
import { useDashboard } from "@/features/dashboard/useDashboard";

/** Home tab: whether the outlet is taking orders, today at a glance, what needs doing, and the latest orders. */
export default function DashboardScreen() {
  const {
    insets, tabBarHeight, tokens, styles, profile, profileLoaded, outletBadge, rating, reviewCount, isMeat, recentOrders, ordersLoading, ordersError, stats, inStock, menuTotal,
    pendingScheduled, refreshing, refresh,
  } = useDashboard();

  return (
    <ScreenShell
      scroll
      refreshing={refreshing}
      onRefresh={refresh}
      contentStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: tabBarHeight }]}
    >
      <DashboardHeader
        name={profile?.name ?? ""}
        image={profile?.image}
        isMeat={isMeat}
        status={outletBadge}
        rating={rating}
        reviewCount={reviewCount}
        styles={styles}
        tokens={tokens}
      />
      <NotificationsOffCard styles={styles} tokens={tokens} />
      <OutletStatusCard profile={profile} loaded={profileLoaded} styles={styles} tokens={tokens} />
      <StatsGrid
        todayOrders={stats.todayOrders}
        todayRevenue={stats.todayRevenue}
        activeOrders={stats.activeOrders}
        inStock={inStock}
        menuTotal={menuTotal}
        isMeat={isMeat}
        styles={styles}
      />
      <ActionNeededCard count={stats.needsAction} styles={styles} />
      <QuickActions pendingScheduled={pendingScheduled} isMeat={isMeat} styles={styles} tokens={tokens} />
      <RecentOrders orders={recentOrders} loading={ordersLoading} error={ordersError} onRetry={refresh} styles={styles} />
    </ScreenShell>
  );
}
