import React from "react";
import { router } from "expo-router";
import { socketService } from "@/utils/socketService";
import { showAlert } from "@/components/ui/AppAlert";

// Part 4 of useRideSearching, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useRideSearchingShowTripDetails(currentOrderId: any, setGlobalDriver: any, setGlobalStatus: any, setTripDetailsVisible: any, setCancelReasonVisible: any, setCancelConfirmVisible: any, setSelectedCancelReason: any) {
  React.useEffect(() => {
    if (currentOrderId) {
      socketService.connect();
      socketService.trackOrder(currentOrderId);

      const handleOrderAccepted = (data: any) => {
        if (data.orderId === currentOrderId) {
          setGlobalDriver(data.driver);
          setGlobalStatus("driver_assigned");
          
          showAlert("Driver Assigned", `${data.driver.name} is on the way!`, [
            {
              text: "OK",
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
