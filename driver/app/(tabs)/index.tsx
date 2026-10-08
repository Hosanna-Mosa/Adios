import React, { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PerformanceCard, PerformanceRange } from "@/features/earnings/components/PerformanceCard";
import type { Hotspot } from "@/features/jobs/components/HighDemandAreas";
import { DriverTabBar, useDriverTabBarHeight } from "@/components/shared/DriverTabBar";
import { useDriverStore } from "@/store/driverStore";
import {
  ActiveTasksSection,
  GoOnlineModal,
  HeadHomeToggle,
  HighDemandAreas,
  HomeGreetingHeader,
  IncomingOrderModal,
  OnlineStatusCard,
  SafetyAlertCard,
  ScheduledRidesSection,
  ServiceToggle,
} from "@/features/jobs/components";
import { styles } from "@/features/jobs/home.styles";
import { useHomeFeeds } from "@/features/jobs/hooks/useHomeFeeds";
import { useOfferPoll } from "@/features/jobs/hooks/useOfferPoll";
import { useOnlineActions } from "@/features/jobs/hooks/useOnlineActions";
import { useScooterAnimation } from "@/features/jobs/hooks/useScooterAnimation";
import { formatCurrency } from "@/utils/format";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { Box } from "@/components/ui/Box";

export default function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useDriverTabBarHeight();
  const [mode, setMode] = useState<"ride" | "delivery">("ride");
  const overlapMargin = -30;
  const [performanceRange, setPerformanceRange] = useState<PerformanceRange>("week");
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [isLoadingHotspots, setIsLoadingHotspots] = useState(false);
  const isOnline = useDriverStore((s) => s.isOnline);
  const homeMode = useDriverStore((s) => s.homeMode);
  const activeServices = useDriverStore((s) => s.activeServices);
  const toggleHomeMode = useDriverStore((s) => s.toggleHomeMode);
  const currentOrder = useDriverStore((s) => s.currentOrder);
  const restoreActiveOrder = useDriverStore((s) => s.restoreActiveOrder);
  // Each time home opens, bring back a job the driver accepted before the app was
  // closed or reloaded, so it shows under Active tasks to continue.
  useFocusEffect(
    useCallback(() => {
      void restoreActiveOrder();
    }, [restoreActiveOrder]),
  );
  const driverName = useDriverStore((s) => s.driverName);
  const earnings = useDriverStore((s) => s.earnings);

  const scooterAnimatedStyle = useScooterAnimation(isOnline);

  const { scheduledRides, refreshFeeds } = useHomeFeeds({
    hotspots,
    setHotspots,
    setIsLoadingHotspots,
  });

  const { refresh: refreshOffer } = useOfferPoll();
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshOffer(), restoreActiveOrder(), refreshFeeds()]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshOffer, restoreActiveOrder, refreshFeeds]);

  const {
    showOnlineModal,
    setShowOnlineModal,
    openDemandAreaInMaps,
    handleToggleOnline,
    handleGoOnline,
  } = useOnlineActions({ onServicesChosen: setMode });

  return (
    <Box style={styles.safe}>
      <ScrollBox
        style={styles.container}
        contentContainerStyle={{ paddingBottom: tabBarHeight }}
        bounces={false}
      >
        {/* Header with Online/Offline Toggle */}
        <HomeGreetingHeader
          driverName={driverName}
          isOnline={isOnline}
          paddingTop={insets.top + 16}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        <Box style={styles.content}>
          <Box style={{ position: 'relative', zIndex: 10, marginTop: overlapMargin, marginBottom: 8 }}>
            <OnlineStatusCard
              isOnline={isOnline}
              activeServices={activeServices}
              onToggle={handleToggleOnline}
              scooterAnimatedStyle={scooterAnimatedStyle}
            />
          </Box>

          {/* Head Home Mode — visible only when online */}
          {isOnline && <HeadHomeToggle homeMode={homeMode} onToggle={toggleHomeMode} />}

          {/* Service Toggle */}
          <ServiceToggle active={mode} onToggle={setMode} />

          {/* Today's Performance — the "This Week" pill used to be a dead control
              (no onPress at all), so it always showed the same fixed set of
              numbers no matter what a driver tapped. It now actually switches
              which range's trips/earnings are the headline stats. */}
          <PerformanceCard
            range={performanceRange}
            onRangeChange={setPerformanceRange}
            stats={
              performanceRange === "today"
                ? [
                    { kind: "trips", label: t("earnings.trips"), value: String(earnings.todayTrips) },
                    { kind: "balance", label: t("earnings.balance"), value: formatCurrency(earnings.today, { decimals: false }), accent: true },
                    { kind: "thisWeek", label: t("earnings.thisWeek"), value: formatCurrency(earnings.week, { decimals: false }) },
                  ]
                : [
                    { kind: "trips", label: t("earnings.trips"), value: String(earnings.totalDeliveries) },
                    { kind: "balance", label: t("earnings.balance"), value: formatCurrency(earnings.week, { decimals: false }), accent: true },
                    { kind: "thisWeek", label: t("earnings.today"), value: formatCurrency(earnings.today, { decimals: false }) },
                  ]
            }
          />

          <ActiveTasksSection currentOrder={currentOrder} isOnline={isOnline} />

          <ScheduledRidesSection
            rides={scheduledRides}
            blockedByCurrentOrder={!!currentOrder}
          />

          {/* High Demand Areas */}
          <Box style={styles.sectionSpacing}>
            <HighDemandAreas
              hotspots={hotspots}
              isLoading={isLoadingHotspots}
              onAreaPress={openDemandAreaInMaps}
            />
          </Box>

          {/* Safety Alerts */}
          <SafetyAlertCard
            title={t("jobs.safetyAlert")}
            message={t("jobs.roadClosureReportedOnMainSt")}
          />
        </Box>
      </ScrollBox>

      <DriverTabBar active="home" />

      <GoOnlineModal
        visible={showOnlineModal}
        onClose={() => setShowOnlineModal(false)}
        onGoOnline={handleGoOnline}
      />

      <IncomingOrderModal />
    </Box>
  );
}
