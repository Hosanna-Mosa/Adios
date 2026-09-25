import React from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { socketService } from "@/utils/socketService";
import i18n from "@/i18n";

// Split out of useRideSearching so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useRideSearchingShowTripDetails(currentOrderId: any, setGlobalDriver: any, setGlobalStatus: any, setTripDetailsVisible: any, setCancelReasonVisible: any, setCancelConfirmVisible: any, setSelectedCancelReason: any) {
  React.useEffect(() => {
    if (currentOrderId) {
      socketService.connect();
      socketService.trackOrder(currentOrderId);

      const handleOrderAccepted = (data: any) => {
        if (data.orderId === currentOrderId) {
          setGlobalDriver(data.driver);
          setGlobalStatus("driver_assigned");
          
          Alert.alert(i18n.t("app.orderStatusTimeline.steps.driverAssigned"), i18n.t("app.ride.varIsOnTheWay", { value: data.driver.name }), [
            {
              text: i18n.t("app.ride.ok"),
              onPress: () => {
                router.push("/tracking");
              }
            }
          ]);
        }
      };

      socketService.on("order_accepted", handleOrderAccepted);
      return () => {
        socketService.off("order_accepted", handleOrderAccepted);
      };
    }
  }, [currentOrderId]);

  const showTripDetails = () => {
    setCancelConfirmVisible(false);
    setCancelReasonVisible(false);
    setTripDetailsVisible(true);
  };
  const showCancelReasons = () => {
    setCancelConfirmVisible(false);
    setCancelReasonVisible(true);
  };
  const selectCancelReason = (reason: string) => {
    setSelectedCancelReason(reason);
    setCancelReasonVisible(false);
    setCancelConfirmVisible(true);
  };

  return { showTripDetails, showCancelReasons, selectCancelReason };
}
