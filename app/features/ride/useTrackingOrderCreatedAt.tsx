import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { MapBackgroundRef } from "@/components/MapBackground";
import { raiseSos } from "@/services/orders.service";
import { showAlert } from "@/components/ui/AppAlert";
import { useToast } from "@/components/ui/Toast";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { cancellationNotice } from "@/utils/cancellationNotice";

// Split out of useTracking so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useTrackingOrderCreatedAt(currentOrderId: any, resetDelivery: any) {
  const { t } = useTranslation();
  const [orderCreatedAt, setOrderCreatedAt] = useState<Date | null>(null);
  const [deliveredAt, setDeliveredAt] = useState<Date | null>(null);
  const [tripModalVisible, setTripModalVisible] = useState(false);
  const [helperStatus, setHelperStatus] = useState<string>("");
  const [deliveryOtp, setDeliveryOtp] = useState<string | null>(null);
  const [startOtp, setStartOtp] = useState<string | null>(null);
  // A package delivery: no start PIN, and its delivery OTP is shared with the receiver.
  const [isPackageDelivery, setIsPackageDelivery] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number; heading?: number } | null>(null);
  const [radius, setRadius] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const mapRef = useRef<MapBackgroundRef>(null);

  const cancellationAlerted = useRef(false);
  const { show: showToast } = useToast();

  // `reason` is who cancelled the order (cancelReason on the backend Order), so the
  // customer is told who. When the status arrived first through the global order
  // poller (no reason passed here), the reason it stored is used instead.
  const handleOrderCancelledByDriver = (reason?: string | null) => {
    if (cancellationAlerted.current) return;
    cancellationAlerted.current = true;
    resetDelivery();
    router.replace("/(tabs)");
    // A toast, not a blocking dialog: landing on Home to a modal you have to tap
    // "OK" on before doing anything else read as a lot of ceremony for a passive
    // notice with nothing to confirm. This surfaces the same instant, over the
    // home screen, and clears itself.
    const who = reason ?? useDeliveryStore.getState().cancelReason;
    // The customer cancelled it themselves — nothing to announce.
    if (who === "customer_cancelled") return;
    showToast(cancellationNotice(who).message, "error");
  };

  const handleSOS = () => {
    if (!currentOrderId) return;
    showAlert(
      t("app.ride.emergencySos"),
      t("app.ride.thisWillInstantlyAlertOurSupport"),
      [
        { text: t("actions.cancel"), style: "cancel" },
        {
          text: t("app.ride.triggerSos"),
          style: "destructive",
          onPress: async () => {
            try {
              await raiseSos(currentOrderId);
              showAlert(t("app.ride.sosDispatched"), t("app.ride.yourEmergencyAlertHasBeenSent"));
            } catch (err: any) {
              showAlert(t("actions.error"), err.message || t("app.ride.failedToTriggerSos"));
            }
          },
        },
      ]
    );
  };

  return { orderCreatedAt, setOrderCreatedAt, deliveredAt, setDeliveredAt, tripModalVisible, setTripModalVisible, helperStatus, setHelperStatus, deliveryOtp, setDeliveryOtp, startOtp, setStartOtp, isPackageDelivery, setIsPackageDelivery, driverLocation, setDriverLocation, radius, setRadius, totalPrice, setTotalPrice, mapRef, cancellationAlerted, handleOrderCancelledByDriver, handleSOS };
}
