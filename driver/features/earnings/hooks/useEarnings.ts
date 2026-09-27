import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import { emptyEarnings, type EarningsResponse } from "../types";

/** Loads the earnings summary and runs the cash-out.
 *
 * Lifted out of the earnings screen unchanged — same requests, same alerts,
 * same refresh-on-focus behaviour. The screen keeps only its markup. */
export function useEarnings() {
  const { t } = useTranslation();
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
      if (!response.ok) throw new Error(data.message || t("earnings.failedToLoadEarnings"));
      setEarnings(data);
    } catch (error: any) {
      Alert.alert(t("earnings.earningsUnavailable"), error.message || t("earnings.pleaseTryAgain"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token, t]);

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
      Alert.alert(t("earnings.passwordRequired"), t("earnings.enterYourDriverPasswordToContinue"));
      return;
    }

    if (!apiUrl || !token) {
      Alert.alert(t("earnings.cashOutUnavailable"), t("auth.pleaseSignInAgain"));
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
      if (!response.ok) throw new Error(data.message || t("earnings.cashOutFailed"));

      setCashOutVisible(false);
      setPassword("");
      // Say only what the backend confirmed: requested, with the bank, or processed.
      const value = Number(data.payout.amount).toFixed(2);
      const status = data.payout.status;
      Alert.alert(
        status === "processed" ? t("earnings.payoutProcessed") : t("earnings.cashOutInitiated"),
        status === "processed"
          ? t("earnings.payoutProcessedBody", { value })
          : status === "processing"
            ? t("earnings.isBeingSentToYourBank", { value, defaultValue: "Rs.{{value}} is being sent to your bank." })
            : t("earnings.payoutRequestedBody", { value }),
      );
      await loadEarnings();
    } catch (error: any) {
      Alert.alert(t("earnings.cashOutFailed"), error.message || t("earnings.pleaseTryAgain"));
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
