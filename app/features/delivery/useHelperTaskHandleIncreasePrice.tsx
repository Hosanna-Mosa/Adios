import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { customFetch } from "@/utils/api/custom-fetch";

// Part 4 of useHelperTask, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useHelperTaskHandleIncreasePrice(setOrderId: any, setStep: any, pickupCoords: any, isPickupValid: any, description: any, setOffer: any, localOrderId: any, setLocalOrderId: any, setIsIncreasingPrice: any, setCurrentTaskPrice: any, setAssignedDriver: any, calculatedFare: any) {
  const { t } = useTranslation();
  const handleIncreasePrice = async (amount: number) => {
    if (!localOrderId) return;
    setIsIncreasingPrice(amount);
    try {
      const updatedOrder = await customFetch<any>(`/orders/${localOrderId}/increase-price`, {
        method: "PATCH",
        body: JSON.stringify({ amount }),
      });
      if (updatedOrder?.customerPrice) setCurrentTaskPrice(updatedOrder.customerPrice);
      else if (updatedOrder?.totalPrice) setCurrentTaskPrice(updatedOrder.totalPrice);
    } catch {
      Alert.alert(t("actions.error"), t("app.delivery.failedToIncreaseTaskPrice"));
    } finally {
      setIsIncreasingPrice(null);
    }
  };

  const handleCancel = () => {
    Alert.alert(t("app.delivery.cancelThisTask"), t("app.delivery.thisCantBeUndone"), [
      { text: t("app.delivery.keepTask"), style: "cancel" },
      {
        text: t("app.delivery.cancelTask"),
        style: "destructive",
        onPress: async () => {
          if (localOrderId) {
            try {
              await customFetch(`/orders/${localOrderId}/status`, { method: "PATCH", body: JSON.stringify({ status: "CANCELLED" }) });
            } catch (error) {
              console.warn("Failed to cancel order on backend", error);
            }
          }
          setStep("compose");
          setAssignedDriver(null);
          setOrderId(null);
          setLocalOrderId(null);
        },
      },
    ]);
  };

  const goToBidding = () => {
    if (!isPickupValid || !pickupCoords?.lat) {
      Alert.alert(t("app.delivery.missingDetails"), t("app.delivery.pleaseSelectAValidPickupLocation"));
      return;
    }
    if (!description.trim()) {
      Alert.alert(t("app.delivery.missingDetails"), t("app.delivery.pleaseProvideABriefDescriptionOf"));
      return;
    }
    setOffer((prev: any) => prev ?? calculatedFare);
    setStep("bidding");
  };

  return { handleIncreasePrice, handleCancel, goToBidding };
}
