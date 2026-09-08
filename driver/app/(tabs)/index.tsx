import React, { useCallback, useEffect, useState } from "react";
import { Alert, Linking, ScrollView, Text, View } from "react-native";
import { useSharedValue, useAnimatedStyle, withSequence, withTiming, Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PerformanceCard } from "@/features/earnings/components/PerformanceCard";
import type { Hotspot } from "@/features/jobs/components/HighDemandAreas";
import { DriverTabBar, useDriverTabBarHeight } from "@/components/shared/DriverTabBar";
import { useDriverStore } from "@/store/driverStore";
import { router } from "expo-router";
import {
  ActiveTaskCard,
  GoOnlineModal,
  HeadHomeToggle,
  HighDemandAreas,
  HomeGreetingHeader,
  IncomingOrderModal,
  NoActiveTasksCard,
  OnlineStatusCard,
  SafetyAlertCard,
  ScheduledRideCard,
  ServiceToggle,
} from "@/features/jobs/components";
import { styles } from "@/features/jobs/home.styles";
import { API_URL as apiUrl } from "@/utils/apiUrl";

const fallbackHotspots: Hotspot[] = [
  {
    id: "fallback-kr-market",
    name: "KR Market",
    address: "KR Market, Huriopet, Chickpet, Bengaluru, Karnataka",
    lat: 12.9616,
    lng: 77.5769,
    surge: "1.5x Surge",
  },
  {
    id: "fallback-kempegowda-airport",
    name: "Kempegowda Airport",
    address: "Kempegowda International Airport, Devanahalli, Bengaluru, Karnataka",
    lat: 13.1986,
    lng: 77.7066,
    surge: "1.3x Surge",
  },
  {
    id: "fallback-orion-mall",
    name: "Orion Mall",
    address: "Orion Mall, Dr Rajkumar Road, Rajajinagar, Bengaluru, Karnataka",
    lat: 13.0112,
    lng: 77.5549,
    surge: "1.2x Surge",
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useDriverTabBarHeight();
  const [mode, setMode] = useState<"ride" | "delivery">("ride");
  const overlapMargin = -30;
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [hotspots, setHotspots] = useState<Hotspot[]>(fallbackHotspots);
  const [isLoadingHotspots, setIsLoadingHotspots] = useState(false);
  const isOnline = useDriverStore((s) => s.isOnline);
  const homeMode = useDriverStore((s) => s.homeMode);
  const activeServices = useDriverStore((s) => s.activeServices);
  const goOnline = useDriverStore((s) => s.goOnline);
  const goOffline = useDriverStore((s) => s.goOffline);
  const identityVerified = useDriverStore((s) => s.identityVerified);
  const setIdentityVerified = useDriverStore((s) => s.setIdentityVerified);
  const toggleHomeMode = useDriverStore((s) => s.toggleHomeMode);
  const currentOrder = useDriverStore((s) => s.currentOrder);
  const token = useDriverStore((s) => s.token);
  const driverName = useDriverStore((s) => s.driverName);
  const earnings = useDriverStore((s) => s.earnings);
  const fetchEarnings = useDriverStore((s) => s.fetchEarnings);

  const [scheduledRides, setScheduledRides] = useState<any[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  
  const [driverAds, setDriverAds] = useState<any[]>([]);

  useEffect(() => {
    if (!apiUrl) return;
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/banners`);
        if (res.ok) {
          const json = await res.json();
          const bannersArray = json.data || json;
          const ads = bannersArray.filter((b: any) => b.itemType === 'ad' && b.position === 'driver_dashboard');
          setDriverAds(ads);
        }
      } catch (err) {
        console.warn("Failed to fetch driver ads:", err);
      }
    })();
  }, []);

  const translateX = useSharedValue(0);
  const scooterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Drive Animation when going online
  useEffect(() => {
    if (isOnline) {
      translateX.value = withSequence(
        // Drive off screen to the right
        withTiming(200, { duration: 500, easing: Easing.in(Easing.back(1.5)) }),
        // Instantly move off-screen left
        withTiming(-300, { duration: 0 }),
        // Drive in from left to original position
        withTiming(0, { duration: 800, easing: Easing.out(Easing.back(1.2)) }),
      );
    }
  }, [isOnline, translateX]);

  const loadScheduledRides = useCallback(async () => {
    if (!apiUrl || !token) return;
    setLoadingScheduled(true);
    try {
      const response = await fetch(`${apiUrl}/orders/driver/scheduled`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setScheduledRides(data);
      }
    } catch (error) {
      console.warn("Failed to load driver scheduled rides:", error);
    } finally {
      setLoadingScheduled(false);
    }
  }, [token]);

  useEffect(() => {
    loadScheduledRides();
    const interval = setInterval(loadScheduledRides, 30 * 1000);
    return () => clearInterval(interval);
  }, [loadScheduledRides]);

  // Fetch real earnings on mount and when token changes
  useEffect(() => {
    if (token) {
      fetchEarnings();
    }
  }, [token, fetchEarnings]);

  const loadHighDemandAreas = useCallback(async () => {
    if (!apiUrl || !token) {
      setHotspots(fallbackHotspots);
      return;
    }

    setIsLoadingHotspots(true);
    try {
      const response = await fetch(`${apiUrl}/drivers/high-demand-areas?limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load high demand areas");

      const areas = await response.json();
      if (Array.isArray(areas) && areas.length > 0) {
        setHotspots(areas);
      } else {
        setHotspots(fallbackHotspots);
      }
    } catch (error) {
      console.warn("High demand area fetch failed:", error);
      setHotspots(fallbackHotspots);
    } finally {
      setIsLoadingHotspots(false);
    }
  }, [token]);

  useEffect(() => {
    loadHighDemandAreas();
    const interval = setInterval(loadHighDemandAreas, 60 * 1000);

    return () => clearInterval(interval);
  }, [loadHighDemandAreas]);

  const openDemandAreaInMaps = async (area: Hotspot) => {
    const query = encodeURIComponent(
      Number.isFinite(area.lat) && Number.isFinite(area.lng)
        ? `${area.lat},${area.lng}`
        : area.address,
    );
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error("Google Maps link is not supported");
      await Linking.openURL(url);
    } catch {
      Alert.alert("Unable to open maps", "Please try again from this device.");
    }
  };

  const handleToggleOnline = () => {
    if (isOnline) {
      Alert.alert(
        "Go Offline",
        "Are you sure you want to go offline? You will stop receiving new requests.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go Offline", style: "destructive", onPress: () => goOffline() }
        ]
      );
      return;
    }

    // Check identity verification before allowing go-online
    if (!identityVerified) {
      Alert.alert(
        "Identity Verification Required",
        "To start receiving orders, you must verify at least one government ID (Aadhaar or PAN Card).",
        [
          { text: "Not Now", style: "cancel" },
          {
            text: "Verify Now",
            onPress: () => router.push("/identity-verify"),
          },
        ]
      );
      return;
    }

    setShowOnlineModal(true);
  };

  // Load identity status from profile on mount
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/drivers/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.verification?.identity != null) {
          setIdentityVerified(data.verification.identity);
        }
      } catch {
        // silently ignore — store defaults to false
      }
    })();
  }, [token]);

  const handleGoOnline = (services: ("food" | "ride")[]) => {
    goOnline(services);
    setMode(services[0] === "food" ? "delivery" : "ride");
  };

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
              { label: "Balance", value: `₹${earnings.today}`, accent: true },
              { label: "This Week", value: `₹${earnings.week}` },
            ]}
          />

          {/* Active Tasks */}
          {currentOrder ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Tasks</Text>
              </View>
              <ActiveTaskCard
                mode={currentOrder.serviceType?.toLowerCase() === "helper" ? "delivery" : "ride"}
                time={currentOrder.timestamp ? new Date(currentOrder.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just Now"}
                pickup={currentOrder.stops?.[0]?.address || currentOrder.stops?.[0]?.locationName || "Pickup Location"}
                dropoff={currentOrder.stops?.[currentOrder.stops.length - 1]?.address || currentOrder.stops?.[currentOrder.stops.length - 1]?.locationName || "Drop-off Location"}
                onGo={() => router.push("/active-order")}
              />
            </>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Tasks</Text>
              </View>
              <NoActiveTasksCard isOnline={isOnline} />
            </>
          )}

          {/* Scheduled Rides Section */}
          {scheduledRides.length > 0 && (
            <View style={styles.sectionSpacing}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Scheduled Rides ({scheduledRides.length})</Text>
              </View>
              <View style={{ gap: 12, marginTop: 8 }}>
                {scheduledRides.map((ride, idx) => (
                  <ScheduledRideCard
                    key={ride._id}
                    ride={ride}
                    index={idx}
                    disabled={!!currentOrder}
                    onStart={() => {
                      const { startReservedRide } = useDriverStore.getState();
                      startReservedRide(ride._id);
                    }}
                  />
                ))}
              </View>
            </View>
          )}

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
