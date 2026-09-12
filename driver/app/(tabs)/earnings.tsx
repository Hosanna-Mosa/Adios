import React from "react";
import { Alert, RefreshControl, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import { router } from "expo-router";

import { DriverTabBar, useDriverTabBarHeight } from "@/components/shared/DriverTabBar";
import { fadeInUp } from "@/motion/presets";
import {
  BalanceCard,
  CashOutButton,
  CashOutDialog,
  EarningsChart,
  EarningsLoadingCard,
  EarningsStatsRow,
  RecentActivityList,
} from "@/features/earnings/components";
import { formatCurrency } from "@/features/earnings/utils/format";
import { useEarnings } from "@/features/earnings/hooks/useEarnings";
import { styles } from "@/features/earnings/earnings.styles";

export default function EarningsScreen() {
  const tabBarHeight = useDriverTabBarHeight();
  const {
    earnings,
    isLoading,
    isRefreshing,
    isCashingOut,
    password,
    setPassword,
    cashOutVisible,
    setCashOutVisible,
    trendLabel,
    loadEarnings,
    handleCashOut,
  } = useEarnings();

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
          <EarningsLoadingCard />
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
