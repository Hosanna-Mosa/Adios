import { useTranslation } from "react-i18next";
import { cancelOrder, increaseOrderPrice, type HelperQuote } from "@/services/orders.service";
import { showAlert } from "@/components/ui/AppAlert";
import { describePaymentError, payOnlineTopup } from "@/utils/razorpay";
import { apiErrorCode, apiErrorMessage, clampOffer, orderPrice } from "./useHelperTask.shared";

// Split out of useHelperTask so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useHelperTaskHandleIncreasePrice(setStep: any, pickupCoords: any, isPickupValid: any, description: any, setOffer: any, localOrderId: any, orderPaymentMethod: any, setOrderPaymentMethod: any, setIsIncreasingPrice: any, setCurrentTaskPrice: any, setSearchExhausted: any, quote: HelperQuote | null, isQuoting: boolean, quoteError: string | null, clearTask: () => void) {
  const { t } = useTranslation();

  // Cash tasks raise in place. A task paid online pays the difference first
  // (POST /payments/create-topup, the same browser checkout as the order), and the
  // server raises the offer once the money is confirmed.
  const raise = async (orderId: string, amount: number) => {
    if (orderPaymentMethod === "online") return payOnlineTopup(orderId, amount);
    try {
      return await increaseOrderPrice(orderId, amount);
    } catch (error) {
      // Paid online after all (e.g. the method wasn't known yet on this screen).
      if (apiErrorCode(error) !== "TOPUP_REQUIRED") throw error;
      setOrderPaymentMethod("online");
      return payOnlineTopup(orderId, amount);
    }
  };

  const handleIncreasePrice = async (amount: number) => {
    if (!localOrderId) return;
    setIsIncreasingPrice(amount);
    try {
      const updatedOrder = await raise(localOrderId, amount);
      const price = orderPrice(updatedOrder);
      if (price) setCurrentTaskPrice(price);
      // The server restarts the search at the new price.
      setSearchExhausted(false);
    } catch (error) {
      if (apiErrorCode(error) === "TOPUP_REFUNDED") {
        showAlert(t("app.payment.topupRefundedTitle"), t("app.payment.topupRefunded"));
      } else {
        const described = describePaymentError(error);
        showAlert(
          described?.title ?? t("actions.error"),
          described?.message ?? apiErrorMessage(error) ?? t("app.delivery.failedToIncreaseTaskPrice"),
        );
      }
    } finally {
      setIsIncreasingPrice(null);
    }
  };

  /** Cancels the task on the server. False (with the reason shown) when the server refused. */
  const cancelTask = async (): Promise<boolean> => {
    if (!localOrderId) return true;
    try {
      await cancelOrder(localOrderId);
      return true;
    } catch (error) {
      // e.g. 409 once the helper has started: the task goes on, so the screen must too.
      showAlert(t("actions.error"), apiErrorMessage(error) ?? t("app.delivery.couldNotCancelTask"));
      return false;
    }
  };

  const handleCancel = () => {
    showAlert(t("app.delivery.cancelThisTask"), t("app.delivery.thisCantBeUndone"), [
      { text: t("app.delivery.keepTask"), style: "cancel" },
      {
        text: t("app.delivery.cancelTask"),
        style: "destructive",
        onPress: async () => {
          if (await cancelTask()) clearTask();
        },
      },
    ]);
  };

  const goToOffer = () => {
    if (!isPickupValid || !pickupCoords?.lat) {
      showAlert(t("app.delivery.missingDetails"), t("app.delivery.pleaseSelectAValidPickupLocation"));
      return;
    }
    if (!description.trim()) {
      showAlert(t("app.delivery.missingDetails"), t("app.delivery.pleaseProvideABriefDescriptionOf"));
      return;
    }
    if (!quote || isQuoting) {
      showAlert(t("app.delivery.priceNotReady"), quoteError ?? t("app.delivery.calculatingPrice"));
      return;
    }
    setOffer((prev: number | null) => clampOffer(prev ?? quote.total, quote));
    setStep("offer");
  };

  return { handleIncreasePrice, handleCancel, cancelTask, goToOffer };
}
