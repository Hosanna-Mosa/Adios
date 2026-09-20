import { useRef, useState } from "react";
import { router } from "expo-router";
import { customFetch } from "@/utils/api/custom-fetch";
import { MapBackgroundRef } from "@/components/MapBackground";
import { showAlert } from "@/components/ui/AppAlert";
import { useToast } from "@/components/ui/Toast";

// Part 2 of useTracking, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

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
  const { show: showToast } = useToast();

  const handleOrderCancelledByDriver = () => {
    if (cancellationAlerted.current) return;
    cancellationAlerted.current = true;
    resetDelivery();
    router.replace("/(tabs)");
    // A toast, not a blocking dialog: landing on Home to a modal you have to tap
    // "OK" on before doing anything else read as a lot of ceremony for a passive
    // notice with nothing to confirm. This surfaces the same instant, over the
    // home screen, and clears itself.
    showToast("This order couldn't be completed and has been cancelled.", "error");
  };

  const handleSOS = () => {
    if (!currentOrderId) return;
    showAlert(
      "Emergency SOS",
      "This will instantly alert our support team and your emergency contacts.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Trigger SOS",
          style: "destructive",
          onPress: async () => {
            try {
              await customFetch(`/orders/${currentOrderId}/sos`, { method: "POST" });
              showAlert("SOS dispatched", "Your emergency alert has been sent. Support is on the way.");
            } catch (err: any) {
              showAlert("Error", err.message || "Failed to trigger SOS. Please call emergency services.");
            }
          },
        },
      ]
    );
  };

  return { orderCreatedAt, setOrderCreatedAt, deliveredAt, setDeliveredAt, tripModalVisible, setTripModalVisible, helperStatus, setHelperStatus, deliveryOtp, setDeliveryOtp, startOtp, setStartOtp, driverLocation, setDriverLocation, radius, setRadius, totalPrice, setTotalPrice, mapRef, cancellationAlerted, handleOrderCancelledByDriver, handleSOS };
}
