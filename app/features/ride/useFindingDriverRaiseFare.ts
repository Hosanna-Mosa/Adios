import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { showAlert } from "@/components/ui/AppAlert";
import { increaseOrderPrice } from "@/services/orders.service";
import { socketService } from "@/utils/socketService";

/** How much a customer can add to the fare in one tap, in rupees. */
export const RAISE_FARE_OPTIONS = [10, 20, 30, 50];

// How long the search runs before the screen offers to raise the fare (the server may offer
// the ride to every rider within this time and none accept, or it may take longer).
const OFFER_AFTER_MS = 45_000;

interface OrderSummary {
  isPackageDelivery?: boolean;
  isFoodOrder?: boolean;
  isReserved?: boolean;
  /** Money was already taken online: a raise there needs an extra payment, which rides don't have. */
  paidOnline?: boolean;
  serviceType?: string;
}

/**
 * "No rider accepted yet — add to your fare" for a bike/auto ride or a package delivery that is
 * still searching. Uses the same server call as a helper task's raise (PATCH /orders/:id/increase-price),
 * which sends the order out to riders again at the new fare.
 */
export function useFindingDriverRaiseFare(orderId: string | undefined, orderSummary: OrderSummary, foodStage: unknown) {
  const { t } = useTranslation();
  const [promptVisible, setPromptVisible] = useState(false);
  const [raising, setRaising] = useState<number | null>(null);
  // Bumped after a raise: the search starts over, so the timer does too.
  const [round, setRound] = useState(0);

  // Cash bike/auto rides and package deliveries only: not food (different dispatch), not a
  // ride booked for later, not one already paid online.
  const eligible =
    !!orderId && !foodStage && !orderSummary.isFoodOrder && !orderSummary.isReserved && !orderSummary.paidOnline;

  useEffect(() => {
    setPromptVisible(false);
    if (!eligible) return;
    const timer = setTimeout(() => setPromptVisible(true), OFFER_AFTER_MS);
    // The server says outright when every rider nearby has passed.
    const onNoDrivers = (data: { orderId?: string }) => {
      if (!data?.orderId || String(data.orderId) === String(orderId)) setPromptVisible(true);
    };
    socketService.on("no_drivers_available", onNoDrivers);
    return () => {
      clearTimeout(timer);
      socketService.off("no_drivers_available", onNoDrivers);
    };
  }, [eligible, orderId, round]);

  const raiseFare = useCallback(
    async (amount: number) => {
      if (!orderId || raising != null) return;
      setRaising(amount);
      try {
        await increaseOrderPrice(orderId, amount);
        // The order is searching again at the new fare; the screen's poll shows the new total.
        setPromptVisible(false);
        setRound((r) => r + 1);
      } catch (error: any) {
        showAlert(t("app.raiseFare.couldntRaise"), error?.message || t("app.ride.pleaseTryAgain"));
      } finally {
        setRaising(null);
      }
    },
    [orderId, raising, t],
  );

  return { showRaiseFare: eligible && promptVisible, raising, raiseFare };
}
