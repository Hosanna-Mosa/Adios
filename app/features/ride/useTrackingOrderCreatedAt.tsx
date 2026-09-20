import { useRef, useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { MapBackgroundRef } from "@/components/MapBackground";
import { raiseSos } from "@/services/orders.service";

// Split out of useTracking so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useTrackingOrderCreatedAt(currentOrderId: any, resetDelivery: any) {
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
      Alert.alert("Order cancelled", "We're sorry — this order could not be completed and has been cancelled.", [{ text: "OK", onPress: () => {} }], { cancelable: true });
    }, 500);
  };

  const handleSOS = () => {
    if (!currentOrderId) return;
    Alert.alert(
      "Emergency SOS",
      "This will instantly alert our support team and your emergency contacts.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Trigger SOS",
          style: "destructive",
          onPress: async () => {
            try {
              await raiseSos(currentOrderId);
              Alert.alert("SOS dispatched", "Your emergency alert has been sent. Support is on the way.");
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to trigger SOS. Please call emergency services.");
            }
          },
        },
      ]
    );
  };

  return { orderCreatedAt, setOrderCreatedAt, deliveredAt, setDeliveredAt, tripModalVisible, setTripModalVisible, helperStatus, setHelperStatus, deliveryOtp, setDeliveryOtp, startOtp, setStartOtp, driverLocation, setDriverLocation, radius, setRadius, totalPrice, setTotalPrice, mapRef, cancellationAlerted, handleOrderCancelledByDriver, handleSOS };
}
