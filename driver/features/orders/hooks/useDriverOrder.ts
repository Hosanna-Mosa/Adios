import { useCallback, useEffect, useState } from "react";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import type { DriverOrder } from "../types";

/** One order for the details screen (`GET /orders/:id`, which already hides what a driver may not see). */
export function useDriverOrder(id?: string) {
  const token = useDriverStore((s) => s.token);
  const [order, setOrder] = useState<DriverOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!apiUrl || !token || !id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order not found");
      setOrder(data);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Order not found");
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  return { order, isLoading, error, reload: load };
}
