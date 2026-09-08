import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import Colors from "@/constants/colors";
import { DriverTabBar, useDriverTabBarHeight } from "@/components/shared/DriverTabBar";
import { useDriverStore } from "@/store/driverStore";
import { fadeInUp } from "@/motion/presets";
import {
  BalanceCard,
  CashOutButton,
  CashOutDialog,
  EarningsChart,
  EarningsStatsRow,
  RecentActivityList,
} from "@/features/earnings/components";
import { formatCurrency } from "@/features/earnings/utils/format";
import { styles } from "@/features/earnings/earnings.styles";
import { API_URL as apiUrl } from "@/utils/apiUrl";


interface WeeklyPoint {
  day: string;
  amount: number;
}

interface ActivityItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  amount: number;
  createdAt: string;
}

interface EarningsResponse {
  availableBalance: number;
  weekBalance: number;
  trendPercent: number;
  weeklyBreakdown: WeeklyPoint[];
  recentActivity: ActivityItem[];
  stats: {
    onlineHours: number;
    totalDistance: number;
    completedTrips: number;
  };
  bank: {
    verified: boolean;
    last4: string | null;
    ifsc: string | null;
  };
}

const emptyEarnings: EarningsResponse = {
  availableBalance: 0,
  weekBalance: 0,
  trendPercent: 0,
  weeklyBreakdown: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    day,
    amount: 0,
  })),
  recentActivity: [],
  stats: {
    onlineHours: 0,
    totalDistance: 0,
    completedTrips: 0,
  },
  bank: {
    verified: false,
    last4: null,
    ifsc: null,
  },
};

export default function EarningsScreen() {
  const tabBarHeight = useDriverTabBarHeight();
  const token = useDriverStore((s) => s.token);
  const [earnings, setEarnings] = useState<EarningsResponse>(emptyEarnings);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCashingOut, setIsCashingOut] = useState(false);
  const [password, setPassword] = useState("");
  const [cashOutVisible, setCashOutVisible] = useState(false);

  const loadEarnings = useCallback(async (refreshing = false) => {
    if (!apiUrl || !token) {
      setEarnings(emptyEarnings);
      setIsLoading(false);
      return;
    }

    refreshing ? setIsRefreshing(true) : setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/drivers/earnings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load earnings");
      setEarnings(data);
    } catch (error: any) {
      Alert.alert("Earnings unavailable", error.message || "Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadEarnings(true);
    }, [loadEarnings])
  );

  const trendLabel = useMemo(() => {
    const prefix = earnings.trendPercent >= 0 ? "+" : "";
    return `${prefix}${earnings.trendPercent}%`;
  }, [earnings.trendPercent]);

  const handleCashOut = async () => {
    if (!password.trim()) {
      Alert.alert("Password required", "Enter your driver password to continue.");
      return;
    }

    if (!apiUrl || !token) {
      Alert.alert("Cash out unavailable", "Please sign in again.");
      return;
    }

    setIsCashingOut(true);
    try {
      const response = await fetch(`${apiUrl}/drivers/cash-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password,
          amount: earnings.availableBalance,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Cash out failed");

      setCashOutVisible(false);
      setPassword("");
      Alert.alert("Cash out initiated", `Rs.${data.payout.amount.toFixed(2)} is being sent to your bank.`);
      await loadEarnings();
    } catch (error: any) {
      Alert.alert("Cash out failed", error.message || "Please try again.");
    } finally {
      setIsCashingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight }]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => loadEarnings(true)} />
        }
      >
        <Text style={styles.headerTitle}>Earnings</Text>

        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : (
          <>
            <BalanceCard
              weekBalance={earnings.weekBalance}
              availableBalance={earnings.availableBalance}
              trendPercent={earnings.trendPercent}
              trendLabel={trendLabel}
              bankLast4={earnings.bank.last4}
            />

            <Animated.View entering={fadeInUp(60)}>
              <EarningsChart data={earnings.weeklyBreakdown} />
            </Animated.View>

            <CashOutButton
              onPress={() => {
                if (!earnings.bank.verified) {
                  Alert.alert(
                    "Bank details required",
                    "You need to add your payout bank details before you can cash out. Would you like to set them up now?",
                    [
                      { text: "Not now", style: "cancel" },
                      { text: "Add Bank Details", onPress: () => router.push("/payout-setup") },
                    ]
                  );
                } else if (earnings.availableBalance < 100) {
                  Alert.alert(
                    "Minimum balance required",
                    `You need at least Rs.100 to cash out. Your current available balance is ${formatCurrency(earnings.availableBalance)}.`
                  );
                } else {
                  setCashOutVisible(true);
                }
              }}
              isLoading={isCashingOut}
            />

            <RecentActivityList transactions={earnings.recentActivity} />

            <EarningsStatsRow
              onlineHours={earnings.stats.onlineHours}
              totalDistance={earnings.stats.totalDistance}
            />
          </>
        )}
      </ScrollView>

      <DriverTabBar active="earnings" />

      <CashOutDialog
        visible={cashOutVisible}
        amount={earnings.availableBalance}
        password={password}
        onPasswordChange={setPassword}
        onConfirm={handleCashOut}
        onCancel={() => setCashOutVisible(false)}
        isCashingOut={isCashingOut}
      />
    </SafeAreaView>
  );
}
