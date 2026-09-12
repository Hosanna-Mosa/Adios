import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import { emptyEarnings, type EarningsResponse } from "../types";

/** Loads the earnings summary and runs the cash-out.
 *
 * Lifted out of the earnings screen unchanged — same requests, same alerts,
 * same refresh-on-focus behaviour. The screen keeps only its markup. */
export function useEarnings() {
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
        headers: { Authorization: `Bearer ${token}` },
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
    }, [loadEarnings]),
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
        body: JSON.stringify({ password, amount: earnings.availableBalance }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Cash out failed");

      setCashOutVisible(false);
      setPassword("");
      Alert.alert(
        "Cash out initiated",
        `Rs.${data.payout.amount.toFixed(2)} is being sent to your bank.`,
      );
      await loadEarnings();
    } catch (error: any) {
      Alert.alert("Cash out failed", error.message || "Please try again.");
    } finally {
      setIsCashingOut(false);
    }
  };

  return {
    earnings, isLoading, isRefreshing, isCashingOut,
    password, setPassword,
    cashOutVisible, setCashOutVisible,
    trendLabel, loadEarnings, handleCashOut,
  };
}
