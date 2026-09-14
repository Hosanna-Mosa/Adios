import { useRef, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { customFetch } from "@/utils/api/custom-fetch";
import { MapBackgroundRef } from "@/components/MapBackground";

// Part 2 of useTracking, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useTrackingOrderCreatedAt(currentOrderId: any, resetDelivery: any) {
  const { t } = useTranslation();
  const [orderCreatedAt, setOrderCreatedAt] = useState<Date | null>(null);
  const [deliveredAt, setDeliveredAt] = useState<Date | null>(null);
  const [tripModalVisible, setTripModalVisible] = useState(false);
  const [helperStatus, setHelperStatus] = useState<string>("");
  const [deliveryOtp, setDeliveryOtp] = useState<string | null>(null);
  const [startOtp, setStartOtp] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number; heading?: number } | null>(null);
  const [radius, setRadius] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const mapRef = useRef<MapBackgroundRef>(null);

  const cancellationAlerted = useRef(false);

  const handleOrderCancelledByDriver = () => {
    if (cancellationAlerted.current) return;
    cancellationAlerted.current = true;
    resetDelivery();
    router.replace("/(tabs)");
    setTimeout(() => {
      Alert.alert(t("app.ride.orderCancelled"), t("app.ride.wereSorryThisOrderCouldNot"), [{ text: t("app.ride.ok"), onPress: () => {} }], { cancelable: true });
    }, 500);
  };

  const handleSOS = () => {
    if (!currentOrderId) return;
    Alert.alert(
      t("app.ride.emergencySos"),
      t("app.ride.thisWillInstantlyAlertOurSupport"),
      [
        { text: t("actions.cancel"), style: "cancel" },
        {
          text: t("app.ride.triggerSos"),
          style: "destructive",
          onPress: async () => {
            try {
              await customFetch(`/orders/${currentOrderId}/sos`, { method: "POST" });
              Alert.alert(t("app.ride.sosDispatched"), t("app.ride.yourEmergencyAlertHasBeenSent"));
            } catch (err: any) {
              Alert.alert(t("actions.error"), err.message || t("app.ride.failedToTriggerSos"));
            }
          },
        },
      ]
    );
  };

  return { orderCreatedAt, setOrderCreatedAt, deliveredAt, setDeliveredAt, tripModalVisible, setTripModalVisible, helperStatus, setHelperStatus, deliveryOtp, setDeliveryOtp, startOtp, setStartOtp, driverLocation, setDriverLocation, radius, setRadius, totalPrice, setTotalPrice, mapRef, cancellationAlerted, handleOrderCancelledByDriver, handleSOS };
}
