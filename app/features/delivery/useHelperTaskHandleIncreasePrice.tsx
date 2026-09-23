import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { cancelOrder, increaseOrderPrice } from "@/services/orders.service";

// Split out of useHelperTask so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useHelperTaskHandleIncreasePrice(setOrderId: any, setStep: any, pickupCoords: any, isPickupValid: any, description: any, setOffer: any, localOrderId: any, setLocalOrderId: any, setIsIncreasingPrice: any, setCurrentTaskPrice: any, setAssignedDriver: any, calculatedFare: any) {
  const { t } = useTranslation();
  const handleIncreasePrice = async (amount: number) => {
    if (!localOrderId) return;
    setIsIncreasingPrice(amount);
    try {
      const updatedOrder = await increaseOrderPrice(localOrderId, amount);
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
              await cancelOrder(localOrderId);
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
