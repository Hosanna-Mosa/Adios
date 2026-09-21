import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Linking, Platform } from "react-native";

import Colors from "@/constants/colors";
import { socketService } from "@/utils/socketService";
import { styles } from "../../active-order.styles";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { formatClock } from "../../orderStops";
import {
  OtpEntry,
  QuickUpdateChips,
  StageActionButton,
  TaskProgressBar,
  TaskTimerDisplay,
} from "../order";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

const QUICK_UPDATES = [
  "Heading to you",
  "Working on task",
  "Shopping for items",
  "Running slightly late",
  "Almost done",
];

export function HelperTaskStage() {
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
    const label = "Customer Location";
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    if (url) Linking.openURL(url);
  };

  const sendHelperUpdate = (text: string) => {
    socketService.emit("helper_status_update", { orderId: currentOrder.id, text });
    Alert.alert("Update Sent", `Sent "${text}" to the customer.`);
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
        heading="Send Quick Update to Customer"
        updates={QUICK_UPDATES}
        onSend={sendHelperUpdate}
      />

      <StageActionButton
        onPress={openGoogleDirections}
        style={{ backgroundColor: Colors.brand, marginBottom: 16 }}
      >
        <Ionicons name="navigate" size={18} color={Colors.white} style={{ marginRight: 8 }} />
        <AppText style={styles.actionBtnText}>Google Directions</AppText>
      </StageActionButton>

      <OtpEntry
        label="ENTER CUSTOMER COMPLETION OTP"
        placeholder="Enter 4-Digit OTP"
        maxLength={4}
        value={verification.customerOTP}
        onChangeText={(val) => {
          verification.setCustomerOTP(val);
          verification.setCustomerOTPError(false);
        }}
        hasError={verification.customerOTPError}
        errorText="Invalid OTP code. Please ask the customer for their task completion OTP."
        style={{ marginBottom: 20 }}
      />

      <StageActionButton
        label="Verify OTP & Complete Task"
        onPress={handleStatusTransition}
        style={isOvertime ? { backgroundColor: Colors.error } : null}
      />
    </Box>
  );
}
