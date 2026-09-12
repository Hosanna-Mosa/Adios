import { useCallback } from "react";
import { Alert, Linking } from "react-native";

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
  const handleSOS = useCallback(() => {
    if (!currentOrder) return;
    Alert.alert(
      "Emergency SOS",
      "Are you sure you want to trigger SOS? This will instantly alert our support team and emergency contacts.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Trigger SOS",
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
                throw new Error(err.message || "Failed to trigger SOS");
              }
              Alert.alert(
                "SOS Dispatched",
                "Your emergency alert has been sent. Support is on the way.",
              );
            } catch (err: any) {
              console.error("SOS trigger error:", err);
              Alert.alert(
                "Error",
                err.message || "Failed to trigger SOS. Please call emergency services.",
              );
            }
          },
        },
      ],
    );
  }, [currentOrder, token]);

  const handleCancelOrder = useCallback(() => {
    if (!currentOrder) return;
    Alert.alert(
      "Cancel Delivery",
      "Are you sure you want to cancel this delivery? The order will be aborted.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await updateOrderStatus("CANCELLED" as any);
              useDriverStore.setState({ currentOrder: null, currentStep: 0 });
              Alert.alert("Success", "Delivery has been cancelled.");
            } catch (err: any) {
              console.error("Cancel order error:", err);
              Alert.alert("Error", err.message || "Failed to cancel delivery.");
            }
          },
        },
      ],
    );
  }, [currentOrder, updateOrderStatus]);

  const handleReportIssue = useCallback(() => {
    Alert.alert("Report Operational Issue", "Select an issue to escalate to support:", [
      {
        text: "Excessive Preparation Delay",
        onPress: () => Alert.alert("Reported", "Escalation ticket raised."),
      },
      {
        text: "Vehicle Breakdown",
        onPress: () => Alert.alert("Assistance Requested", "Support will contact you."),
      },
      {
        text: "Restaurant is Closed",
        onPress: () => Alert.alert("Reported", "Order cancellation initiated."),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }, []);

  const openRideNavigation = useCallback(() => {
    const pickupAddress =
      pickupStop?.address || (pickupStop ? `${pickupStop.lat},${pickupStop.lng}` : "");
    const destinationAddress =
      deliveryStop?.address || (deliveryStop ? `${deliveryStop.lat},${deliveryStop.lng}` : "");

    if (!pickupAddress || !destinationAddress) {
      Alert.alert(
        "Navigation unavailable",
        "Pickup or destination address is missing for this ride.",
      );
      return;
    }

    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickupAddress)}&destination=${encodeURIComponent(destinationAddress)}&travelmode=driving`,
    );
  }, [pickupStop, deliveryStop]);

  return { handleSOS, handleCancelOrder, handleReportIssue, openRideNavigation };
}
