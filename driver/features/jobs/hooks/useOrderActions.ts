import { useCallback } from "react";
import { Alert, Linking } from "react-native";
import { useTranslation } from "react-i18next";

import { useDriverStore } from "@/store/driverStore";
import { API_URL } from "@/utils/apiUrl";

/** SOS, cancellation, issue escalation and hand-off to Google Maps. */
export function useOrderActions(
  currentOrder: any,
  token: string | null | undefined,
  updateOrderStatus: (status: any) => Promise<any>,
  pickupStop: any,
  deliveryStop: any,
) {
  const { t } = useTranslation();

  const handleSOS = useCallback(() => {
    if (!currentOrder) return;
    Alert.alert(
      t("jobs.emergencySos"),
      t("jobs.areYouSureYouWantToTriggerSos"),
      [
        { text: t("actions.cancel"), style: "cancel" },
        {
          text: t("jobs.triggerSos"),
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/orders/${currentOrder.id}/sos`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });
              if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || t("jobs.failedToTriggerSos"));
              }
              Alert.alert(
                t("jobs.sosDispatched"),
                t("jobs.emergencyAlertSentSupportOnTheWay"),
              );
            } catch (err: any) {
              console.error("SOS trigger error:", err);
              Alert.alert(
                t("auth.errorTitle"),
                err.message || t("jobs.failedToTriggerSosCallEmergency"),
              );
            }
          },
        },
      ],
    );
  }, [currentOrder, token, t]);

  const handleCancelOrder = useCallback(() => {
    if (!currentOrder) return;
    Alert.alert(
      t("jobs.cancelDelivery"),
      t("jobs.areYouSureYouWantToCancelThisDelivery"),
      [
        { text: t("jobs.no"), style: "cancel" },
        {
          text: t("jobs.yesCancel"),
          style: "destructive",
          onPress: async () => {
            try {
              await updateOrderStatus("CANCELLED" as any);
              useDriverStore.setState({ currentOrder: null, currentStep: 0 });
              Alert.alert(t("profile.success"), t("jobs.deliveryHasBeenCancelled"));
            } catch (err: any) {
              console.error("Cancel order error:", err);
              Alert.alert(t("auth.errorTitle"), err.message || t("jobs.failedToCancelDelivery"));
            }
          },
        },
      ],
    );
  }, [currentOrder, updateOrderStatus, t]);

  const handleReportIssue = useCallback(() => {
    Alert.alert(t("jobs.reportOperationalIssue"), t("jobs.selectAnIssueToEscalate"), [
      {
        text: t("jobs.excessivePreparationDelay"),
        onPress: () => Alert.alert(t("jobs.reported"), t("jobs.escalationTicketRaised")),
      },
      {
        text: t("jobs.vehicleBreakdown"),
        onPress: () => Alert.alert(t("jobs.assistanceRequested"), t("jobs.supportWillContactYou")),
      },
      {
        text: t("jobs.restaurantIsClosed"),
        onPress: () => Alert.alert(t("jobs.reported"), t("jobs.orderCancellationInitiated")),
      },
      { text: t("actions.cancel"), style: "cancel" },
    ]);
  }, [t]);

  const openRideNavigation = useCallback(() => {
    const pickupAddress =
      pickupStop?.address || (pickupStop ? `${pickupStop.lat},${pickupStop.lng}` : "");
    const destinationAddress =
      deliveryStop?.address || (deliveryStop ? `${deliveryStop.lat},${deliveryStop.lng}` : "");

    if (!pickupAddress || !destinationAddress) {
      Alert.alert(
        t("jobs.navigationUnavailable"),
        t("jobs.pickupOrDestinationAddressMissing"),
      );
      return;
    }

    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickupAddress)}&destination=${encodeURIComponent(destinationAddress)}&travelmode=driving`,
    );
  }, [pickupStop, deliveryStop, t]);

  return { handleSOS, handleCancelOrder, handleReportIssue, openRideNavigation };
}
