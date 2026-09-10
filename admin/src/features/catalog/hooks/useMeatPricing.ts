import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api-client";

export interface GlobalPrice {
  name: string;
  weight: string;
  price: number;
  category: string;
}

/** All state/query/mutation logic for MeatPricing.tsx (work queue item #18). */
export function useMeatPricing() {
  const queryClient = useQueryClient();
  const [localPrices, setLocalPrices] = useState<Record<string, number>>({});

  // Fetch current master prices
  const { data: prices, isLoading } = useQuery({
    queryKey: ["global-meat-prices"],
    queryFn: async () => {
      // If we don't have an endpoint to list global prices yet, we can fetch from a generic one
      // For now, let's assume we can get them from a mock or initial data
      const res = await adminFetch<GlobalPrice[]>("/meat/menu/global");
      return res;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedItems: { name: string; price: number }[]) =>
      adminFetch("/meat/global-prices", {
        method: "PUT",
        body: JSON.stringify({ items: updatedItems }),
      }),
    onSuccess: () => {
      toast.success("Global prices updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["global-meat-prices"] });
      setLocalPrices({});
    },
    onError: () => toast.error("Failed to update prices"),
  });

  const handlePriceChange = (name: string, value: string) => {
    setLocalPrices((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSave = () => {
    const itemsToUpdate = Object.entries(localPrices).map(([name, price]) => ({
      name,
      price,
    }));
    if (itemsToUpdate.length === 0) {
      toast.info("No changes to save");
      return;
    }
    updateMutation.mutate(itemsToUpdate);
  };

  return {
    prices,
    isLoading,
    handlePriceChange,
    handleSave,
    isSaving: updateMutation.isPending,
  };
}
