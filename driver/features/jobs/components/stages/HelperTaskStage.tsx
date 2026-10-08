import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Linking, Platform } from "react-native";
import { useTranslation } from "react-i18next";

import Colors from "@/constants/colors";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import { styles } from "../../active-order.styles";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { formatClock } from "../../orderStops";
import {
  CashCollectionPanel,
  OtpEntry,
  QuickUpdateChips,
  StageActionButton,
  TaskProgressBar,
  TaskTimerDisplay,
} from "../order";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

export function HelperTaskStage() {
  const { t } = useTranslation();
  const QUICK_UPDATES = [
    t("jobs.quickUpdateHeadingToYou"),
    t("jobs.quickUpdateWorkingOnTask"),
    t("jobs.quickUpdateShoppingForItems"),
    t("jobs.quickUpdateRunningSlightlyLate"),
    t("jobs.quickUpdateAlmostDone"),
  ];
  const {
    taskTimerSeconds, currentOrder, pickupStop, verification, handleStatusTransition,
  } = useActiveOrderCtx();

  const bookedSeconds = (parseFloat(currentOrder.duration || "1") || 1) * 3600;
  const rawProgress = (taskTimerSeconds / bookedSeconds) * 100;
  const progress = isNaN(rawProgress) ? 0 : Math.min(rawProgress, 100);
  const isOvertime = taskTimerSeconds > bookedSeconds;

  const openGoogleDirections = () => {
    if (!pickupStop) return;
    const scheme = Platform.select({ ios: "maps://0,0?q=", android: "geo:0,0?q=" });
    const latLng = `${pickupStop.lat},${pickupStop.lng}`;
    const label = t("jobs.customerLocation");
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    if (url) Linking.openURL(url);
  };

  const sendHelperUpdate = async (text: string) => {
    const token = useDriverStore.getState().token;
    try {
      const res = await fetch(`${apiUrl}/orders/${currentOrder.id}/helper/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || t("jobs.connectionFailedPleaseTryAgain"));
      }
      Alert.alert(t("jobs.updateSent"), t("jobs.sentToCustomer", { value: text, defaultValue: 'Sent "{{value}}" to the customer.' }));
    } catch (err: any) {
      Alert.alert(t("jobs.updateNotSent"), err?.message || t("jobs.connectionFailedPleaseTryAgain"));
    }
  };

  return (
    <Box style={styles.stepContainer}>
      <TaskTimerDisplay time={formatClock(taskTimerSeconds)} isOvertime={isOvertime} />

      <TaskProgressBar
        progress={progress}
        isOvertime={isOvertime}
        hoursBooked={currentOrder.duration || "1"}
      />

      <QuickUpdateChips
        heading={t("jobs.sendQuickUpdateToCustomer")}
        updates={QUICK_UPDATES}
        onSend={sendHelperUpdate}
      />

      <StageActionButton
        onPress={openGoogleDirections}
        style={{ backgroundColor: Colors.brand, marginBottom: 16 }}
      >
        <Ionicons name="navigate" size={18} color={Colors.white} style={{ marginRight: 8 }} />
        <AppText style={styles.actionBtnText}>{t("jobs.googleDirections")}</AppText>
      </StageActionButton>

      <CashCollectionPanel />

      <OtpEntry
        label={t("jobs.enterCustomerCompletionOtp")}
        placeholder={t("jobs.enter4DigitOtp")}
        maxLength={4}
        value={verification.customerOTP}
        onChangeText={(val) => {
          verification.setCustomerOTP(val);
          verification.setCustomerOTPError(false);
        }}
        hasError={verification.customerOTPError}
        errorText={t("jobs.invalidOtpAskCustomerTaskCompletion")}
        style={{ marginBottom: 20 }}
      />

      <StageActionButton
        label={t("jobs.verifyOtpAndCompleteTask")}
        onPress={handleStatusTransition}
        style={isOvertime ? { backgroundColor: Colors.error } : null}
      />
    </Box>
  );
}
