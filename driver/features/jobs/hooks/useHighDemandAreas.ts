import { useEffect, useState } from "react";

import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import type { Hotspot } from "../components/HighDemandAreas";

/** GET /drivers/high-demand-areas — computed by the backend from recent, real
 * order activity. Throws when the request fails; an empty list is a real
 * "no demand right now", not an error. */
export async function fetchHighDemandAreas(token: string, limit: number): Promise<Hotspot[]> {
  const response = await fetch(`${apiUrl}/drivers/high-demand-areas?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to load high demand areas");

  const areas = await response.json();
  return Array.isArray(areas) ? areas : [];
}

/** The same areas the home screen lists, loaded once for a screen that only
 * glances at them (the delivery-complete summary). Empty while loading, when
 * there are none, and when the request fails — callers hide the section then. */
export function useHighDemandAreas(limit: number) {
  const token = useDriverStore((s) => s.token);
  const [areas, setAreas] = useState<Hotspot[]>([]);

  useEffect(() => {
    if (!apiUrl || !token) return;
    let cancelled = false;
    fetchHighDemandAreas(token, limit)
      .then((list) => {
        if (!cancelled) setAreas(list);
      })
      .catch((error) => console.warn("High demand area fetch failed:", error));
    return () => {
      cancelled = true;
    };
  }, [token, limit]);

  return areas;
}
