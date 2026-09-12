import React, { useState } from "react";
import { ScrollView, View } from "react-native";
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
import { fallbackHotspots } from "@/features/jobs/fallbackHotspots";
import { useHomeFeeds } from "@/features/jobs/hooks/useHomeFeeds";
import { useOnlineActions } from "@/features/jobs/hooks/useOnlineActions";
import { useScooterAnimation } from "@/features/jobs/hooks/useScooterAnimation";
import { formatCurrency } from "@/utils/format";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useDriverTabBarHeight();
  const [mode, setMode] = useState<"ride" | "delivery">("ride");
  const overlapMargin = -30;
  const [hotspots, setHotspots] = useState<Hotspot[]>(fallbackHotspots);
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
    <View style={styles.safe}>
      <ScrollView
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

        <View style={styles.content}>
          <View style={{ position: 'relative', zIndex: 10, marginTop: overlapMargin, marginBottom: 8 }}>
            <OnlineStatusCard
              isOnline={isOnline}
              activeServices={activeServices}
              onToggle={handleToggleOnline}
              scooterAnimatedStyle={scooterAnimatedStyle}
            />
          </View>

          {/* Head Home Mode — visible only when online */}
          {isOnline && <HeadHomeToggle homeMode={homeMode} onToggle={toggleHomeMode} />}

          {/* Service Toggle */}
          <ServiceToggle active={mode} onToggle={setMode} />

          {/* Today's Performance */}
          <PerformanceCard
            stats={[
              { label: "Trips", value: String(earnings.totalDeliveries) },
              { label: "Balance", value: formatCurrency(earnings.today, { decimals: false }), accent: true },
              { label: "This Week", value: formatCurrency(earnings.week, { decimals: false }) },
            ]}
          />

          <ActiveTasksSection currentOrder={currentOrder} isOnline={isOnline} />

          <ScheduledRidesSection
            rides={scheduledRides}
            blockedByCurrentOrder={!!currentOrder}
          />

          {/* High Demand Areas */}
          <View style={styles.sectionSpacing}>
            <HighDemandAreas
              hotspots={hotspots}
              isLoading={isLoadingHotspots}
              onAreaPress={openDemandAreaInMaps}
            />
          </View>

          {/* Safety Alerts */}
          <SafetyAlertCard
            title="Safety Alert"
            message="Road closure reported on Main St due to construction. Use alternate route."
          />
        </View>
      </ScrollView>

      <DriverTabBar active="home" />

      <GoOnlineModal
        visible={showOnlineModal}
        onClose={() => setShowOnlineModal(false)}
        onGoOnline={handleGoOnline}
      />

      <IncomingOrderModal />
    </View>
  );
}
