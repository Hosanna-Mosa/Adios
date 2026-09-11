import { useEffect } from "react";
import { BACKEND_URL } from "./useAddStop.shared";

// Part 2 of useAddStop, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useAddStopHandleAddressInput(address: any, setAddress: any, setAddressInput: any, storeName: any, setStoreName: any, coords: any, setCoords: any, setAutocompleteSuggestions: any, setShowDropdown: any, setPreviewDelta: any, setIsPreviewing: any, currentCoords: any, stops: any, route: any, fetchAutocompleteSuggestions: any) {
  const handleAddressInput = (text: string) => {
    setAddressInput(text);
    if (address && text !== address) { setAddress(""); setCoords(undefined); }
    fetchAutocompleteSuggestions(text);
  };

  const handleSelectSuggestion = async (item: any) => {
    const displayAddress = item.address || item.description || item.name;
    setAddress(displayAddress);
    setAddressInput(displayAddress);
    if (item.lat && item.lng) {
      setCoords({ lat: item.lat, lng: item.lng });
    } else if (item.id) {
      try {
        const response = await fetch(`${BACKEND_URL}/places/details/${item.id}`);
        const data = await response.json();
        if (data.lat && data.lng) setCoords({ lat: data.lat, lng: data.lng });
      } catch (error) {
        console.error("Error fetching place details:", error);
      }
    }
    if (!storeName && item.name) setStoreName(item.name);
    setAutocompleteSuggestions([]);
    setShowDropdown(false);
  };

  // Real fare-delta preview: asks the same routing endpoint what the trip
  // would look like with this stop included, before it's committed.
  useEffect(() => {
    if (!coords || !currentCoords) { setPreviewDelta(null); return; }
    let cancelled = false;
    setIsPreviewing(true);
    (async () => {
      try {
        const hypotheticalStops = [...stops, { id: "preview", address, lat: coords.lat, lng: coords.lng, type: "pickup" }];
        const response = await fetch(`${BACKEND_URL}/routing/optimize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin: currentCoords, stops: hypotheticalStops }),
        });
        const data = await response.json();
        if (!cancelled && data.totalDistance != null) {
          const baseFee = 2.0;
          const distanceCost = Math.round(data.totalDistance * 0.6 * 100) / 100;
          const stopCharges = hypotheticalStops.length * 1.5;
          const newTotal = Math.round((baseFee + distanceCost + stopCharges) * 100) / 100;
          setPreviewDelta({ distanceKm: Math.round((data.totalDistance - (route?.totalDistance || 0)) * 10) / 10, newTotal });
        }
      } catch (error) {
        console.error("Preview route failed:", error);
      } finally {
        if (!cancelled) setIsPreviewing(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.lat, coords?.lng]);

  return { handleAddressInput, handleSelectSuggestion };
}
