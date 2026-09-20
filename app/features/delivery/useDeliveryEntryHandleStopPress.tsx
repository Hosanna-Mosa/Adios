import { useEffect } from "react";
import { router } from "expo-router";

// Split out of useDeliveryEntry so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useDeliveryEntryHandleStopPress(stops: any, route: any, price: any, currentCoords: any, setStops: any, setRoute: any, calculatePrice: any, setIsCalculating: any, mapRef: any) {
  const handleStopPress = (stop: any) => {
    if (stop.lat && stop.lng) mapRef.current?.panTo(stop.lat, stop.lng);
  };

  // Live route + fee estimate, recomputed as stops change, so the price is
  // never a reveal at checkout — matches the real /routing/optimize call
  // that used to only fire once, on the final button press.
  useEffect(() => {
    if (stops.length === 0 || !currentCoords) {
      setRoute(null as any);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setIsCalculating(true);
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/routing/optimize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin: currentCoords, stops }),
        });
        const data = await response.json();
        if (!cancelled && data.optimizedStops && data.polyline) {
          setStops(data.optimizedStops);
          setRoute({ totalDistance: data.totalDistance, estimatedTime: data.estimatedTime, polyline: data.polyline });
          calculatePrice();
        }
      } catch (error) {
        console.error("Optimization failed:", error);
      } finally {
        if (!cancelled) setIsCalculating(false);
      }
    }, 500);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops.length, currentCoords?.lat, currentCoords?.lng]);

  const handleReview = () => {
    if (stops.length === 0) return;
    router.push("/delivery/checkout");
  };

  return { handleStopPress, handleReview };
}
