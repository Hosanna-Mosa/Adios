import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PerformanceCard } from "@/features/earnings/components/PerformanceCard";
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
import { getFallbackHotspots } from "@/features/jobs/fallbackHotspots";
import { useHomeFeeds } from "@/features/jobs/hooks/useHomeFeeds";
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
  const [hotspots, setHotspots] = useState<Hotspot[]>(getFallbackHotspots);
  const [isLoadingHotspots, setIsLoadingHotspots] = useState(false);
  const isOnline = useDriverStore((s) => s.isOnline);
  const homeMode = useDriverStore((s) => s.homeMode);
  const activeServices = useDriverStore((s) => s.activeServices);
  const toggleHomeMode = useDriverStore((s) => s.toggleHomeMode);
  const currentOrder = useDriverStore((s) => s.currentOrder);
  const driverName = useDriverStore((s) => s.driverName);
  const earnings = useDriverStore((s) => s.earnings);

  const scooterAnimatedStyle = useScooterAnimation(isOnline);

  const { scheduledRides } = useHomeFeeds({
    hotspots,
    setHotspots,
    setIsLoadingHotspots,
  });

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

          {/* Today's Performance */}
          <PerformanceCard
            stats={[
              { kind: "trips", label: t("earnings.trips"), value: String(earnings.totalDeliveries) },
              { kind: "balance", label: t("earnings.balance"), value: formatCurrency(earnings.today, { decimals: false }), accent: true },
              { kind: "thisWeek", label: t("earnings.thisWeek"), value: formatCurrency(earnings.week, { decimals: false }) },
            ]}
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
