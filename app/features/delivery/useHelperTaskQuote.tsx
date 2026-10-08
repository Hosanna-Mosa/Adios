import { useEffect, useState } from "react";
import i18n from "@/i18n";
import { getHelperQuote, type HelperQuote } from "@/services/orders.service";
import { QUOTE_DEBOUNCE_MS, apiErrorMessage } from "./useHelperTask.shared";

// The price of a helper task comes from the server (GET /orders/helper-quote): it is
// the same calculation POST /orders checks the offer against, so the app never
// shows a total or a range the server would then reject. Re-asked, debounced,
// whenever the pickup, the drop-off or the hours change.

type Coords = { lat: number; lng: number } | null;

export function useHelperTaskQuote(pickupCoords: Coords, dropoffCoords: Coords, totalHours: number) {
  const [quote, setQuote] = useState<HelperQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const pickupLat = pickupCoords?.lat;
  const pickupLng = pickupCoords?.lng;
  const dropLat = dropoffCoords?.lat;
  const dropLng = dropoffCoords?.lng;

  useEffect(() => {
    if (pickupLat == null || pickupLng == null) {
      setQuote(null);
      setQuoteError(null);
      setIsQuoting(false);
      return;
    }
    let cancelled = false;
    setIsQuoting(true);
    const timer = setTimeout(async () => {
      try {
        const next = await getHelperQuote({ pickupLat, pickupLng, dropLat, dropLng, hours: totalHours });
        if (cancelled) return;
        setQuote(next);
        setQuoteError(null);
      } catch (error) {
        if (cancelled) return;
        setQuote(null);
        setQuoteError(apiErrorMessage(error) ?? i18n.t("app.delivery.couldNotGetPrice"));
      } finally {
        if (!cancelled) setIsQuoting(false);
      }
    }, QUOTE_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pickupLat, pickupLng, dropLat, dropLng, totalHours]);

  return { quote, isQuoting, quoteError };
}
