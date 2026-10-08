import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking } from "react-native";
import { useTranslation } from "react-i18next";

import Colors from "@/constants/colors";
import { socketService } from "@/utils/socketService";
import { styles } from "../../active-order.styles";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { formatClock } from "../../orderStops";
import { callPhone } from "../../utils/callPhone";
import {
  CashCollectionPanel,
  ContactActions,
  OtpEntry,
  QuickUpdateChips,
  RoundCommButton,
  StageActionButton,
  StageTitleRow,
  StopInfoItem,
  StopsDivider,
  StopsPanel,
  TaskProgressBar,
  TaskTimerDisplay,
  UnreadBadge,
  WaitNotification,
} from "../order";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Google Maps directions to a stop, when it has coordinates. */
function DirectionsButton({ stop }: { stop: any }) {
  if (stop?.lat == null || stop?.lng == null) return null;
  return (
    <RoundCommButton
      icon="navigate"
      onPress={() =>
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`)
      }
    />
  );
}

/**
 * The whole helper task until it's done. Assigned: what the task is, where, and the
 * customer's start OTP. Started (the server accepted that OTP): the clock from the server's
 * taskStartedAt, cash, and the completion PIN. Both codes are checked only by the server.
 */
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
    taskTimerSeconds, currentOrder, status, pickupStop, deliveryStop, unreadCount,
    verification, handleStatusTransition,
  } = useActiveOrderCtx();
  const [submitting, setSubmitting] = useState(false);

  const started = status === "in_progress";
  const bookedHours = currentOrder.bookedHours || 1;
  const bookedSeconds = bookedHours * 3600;
  const rawProgress = (taskTimerSeconds / bookedSeconds) * 100;
  const progress = isNaN(rawProgress) ? 0 : Math.min(rawProgress, 100);
  const isOvertime = taskTimerSeconds > bookedSeconds;
  const overtimeMinutes = Math.ceil((taskTimerSeconds - bookedSeconds) / 60);

  const sendHelperUpdate = (text: string) => {
    socketService.emit("helper_status_update", { orderId: currentOrder.id, text });
    Alert.alert(t("jobs.updateSent"), t("jobs.sentToCustomer", { value: text, defaultValue: 'Sent "{{value}}" to the customer.' }));
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await handleStatusTransition();
    } finally {
      setSubmitting(false);
    }
  };

  const openChat = () =>
    router.push({ pathname: "/chat", params: { orderId: currentOrder.id } });

  return (
    <Box style={styles.stepContainer}>
      <StageTitleRow
        title={started ? t("jobs.taskInProgress") : t("jobs.taskAssigned")}
        actions={
          <ContactActions>
            <RoundCommButton icon="chatbubble-ellipses" onPress={openChat}>
              <UnreadBadge count={unreadCount} />
            </RoundCommButton>
            <RoundCommButton
              icon="call"
              onPress={() => callPhone(currentOrder.customerPhone, "customer")}
            />
          </ContactActions>
        }
      />

      {started && (
        <>
          <TaskTimerDisplay time={formatClock(taskTimerSeconds)} isOvertime={isOvertime} />
          <TaskProgressBar
            progress={progress}
            isOvertime={isOvertime}
            overtimeMinutes={overtimeMinutes}
            hoursBooked={bookedHours}
          />
        </>
      )}

      <StopsPanel>
        <StopInfoItem
          label={t("jobs.taskDetails")}
          name={currentOrder.taskDescription || t("jobs.noTaskDescription")}
          address={t("jobs.hoursBookedN", { value: bookedHours, defaultValue: "{{value}} Hours Booked" })}
        />
        <StopsDivider />
        <StopInfoItem
          label={t("jobs.taskLocation")}
          name={pickupStop?.locationName || t("jobs.customerLocation")}
          address={pickupStop?.address}
          layout="row"
          actions={<DirectionsButton stop={pickupStop} />}
        />
        {deliveryStop && (
          <>
            <StopsDivider />
            <StopInfoItem
              label={t("jobs.dropoffLocation")}
              name={deliveryStop.locationName || t("jobs.dropoff")}
              address={deliveryStop.address}
              layout="row"
              actions={<DirectionsButton stop={deliveryStop} />}
            />
          </>
        )}
      </StopsPanel>

      <QuickUpdateChips
        heading={t("jobs.sendQuickUpdateToCustomer")}
        updates={QUICK_UPDATES}
        onSend={sendHelperUpdate}
      />

      {started ? (
        <>
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
            errorText={verification.otpErrorMessage || t("jobs.invalidOtpAskCustomerTaskCompletion")}
            style={{ marginBottom: 20 }}
          />

          <StageActionButton
            label={t("jobs.verifyOtpAndCompleteTask")}
            onPress={submit}
            disabled={submitting}
            style={isOvertime ? { backgroundColor: Colors.error } : null}
          />
        </>
      ) : (
        <>
          {/* Info only: the customer may confirm in chat, but Start needs just their OTP. */}
          <WaitNotification
            message={
              currentOrder.assignConfirmedAt
                ? t("jobs.customerConfirmedTask")
                : t("jobs.customerNotConfirmedTaskYet")
            }
          />

          <StageActionButton
            onPress={openChat}
            style={{
              backgroundColor: Colors.brandSkin,
              borderWidth: 1,
              borderColor: Colors.primaryLight,
              elevation: 0,
              marginBottom: 16,
            }}
          >
            <Box style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="chatbubble-ellipses" size={18} color={Colors.brand} style={{ marginRight: 8 }} />
              <AppText style={[styles.actionBtnText, { color: Colors.brand }]}>
                {t("jobs.chatWithCustomer")}
              </AppText>
            </Box>
          </StageActionButton>

          <OtpEntry
            label={t("jobs.enterCustomerStartOtp")}
            placeholder={t("jobs.enter4DigitOtp")}
            maxLength={4}
            value={verification.restaurantOTP}
            onChangeText={(val) => {
              verification.setRestaurantOTP(val);
              verification.setRestaurantOTPError(false);
            }}
            hasError={verification.restaurantOTPError}
            errorText={verification.otpErrorMessage || t("jobs.enterStartOtpFromCustomer")}
            style={{ marginBottom: 20 }}
          />

          <StageActionButton
            label={t("jobs.startTask")}
            onPress={submit}
            disabled={submitting}
          />
        </>
      )}
    </Box>
  );
}
