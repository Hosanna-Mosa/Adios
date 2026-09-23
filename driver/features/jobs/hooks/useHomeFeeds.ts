import { useCallback, useEffect, useState } from "react";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import type { Hotspot } from "../components/HighDemandAreas";
import { getFallbackHotspots } from "../fallbackHotspots";

/** The three background feeds behind the home screen: high-demand hotspots,
 * scheduled rides and driver ads. Each refreshes on its own interval.
 * Lifted out of the home screen unchanged. */
export function useHomeFeeds({
  hotspots,
  setHotspots,
  setIsLoadingHotspots,
}: {
  hotspots: Hotspot[];
  setHotspots: (v: Hotspot[]) => void;
  setIsLoadingHotspots: (v: boolean) => void;
}) {
  const token = useDriverStore((s) => s.token);
  const fetchEarnings = useDriverStore((s) => s.fetchEarnings);
  const [scheduledRides, setScheduledRides] = useState<any[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  
  const [driverAds, setDriverAds] = useState<any[]>([]);

  useEffect(() => {
    if (!apiUrl) return;
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/banners`);
        if (res.ok) {
          const json = await res.json();
          const bannersArray = json.data || json;
          const ads = bannersArray.filter((b: any) => b.itemType === 'ad' && b.position === 'driver_dashboard');
          setDriverAds(ads);
        }
      } catch (err) {
        console.warn("Failed to fetch driver ads:", err);
      }
    })();
  }, []);

  const loadScheduledRides = useCallback(async () => {
    if (!apiUrl || !token) return;
    setLoadingScheduled(true);
    try {
      const response = await fetch(`${apiUrl}/orders/driver/scheduled`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setScheduledRides(data);
      }
    } catch (error) {
      console.warn("Failed to load driver scheduled rides:", error);
    } finally {
      setLoadingScheduled(false);
    }
  }, [token]);

  useEffect(() => {
    loadScheduledRides();
    const interval = setInterval(loadScheduledRides, 30 * 1000);
    return () => clearInterval(interval);
  }, [loadScheduledRides]);

  // Fetch real earnings on mount and when token changes
  useEffect(() => {
    if (token) {
      fetchEarnings();
    }
  }, [token, fetchEarnings]);

  const loadHighDemandAreas = useCallback(async () => {
    if (!apiUrl || !token) {
      setHotspots(getFallbackHotspots());
      return;
    }

    setIsLoadingHotspots(true);
    try {
      const response = await fetch(`${apiUrl}/drivers/high-demand-areas?limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load high demand areas");

      const areas = await response.json();
      if (Array.isArray(areas) && areas.length > 0) {
        setHotspots(areas);
      } else {
        setHotspots(getFallbackHotspots());
      }
    } catch (error) {
      console.warn("High demand area fetch failed:", error);
      setHotspots(getFallbackHotspots());
    } finally {
      setIsLoadingHotspots(false);
    }
  }, [token]);

  useEffect(() => {
    loadHighDemandAreas();
    const interval = setInterval(loadHighDemandAreas, 60 * 1000);

    return () => clearInterval(interval);
  }, [loadHighDemandAreas]);

  return { scheduledRides, loadingScheduled, driverAds };
}
