import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import { toast } from "sonner";

export interface MeatItem {
  _id: string;
  name: string;
  weight: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  isGlobalItem?: boolean;
}

const blankItem = {
  name: "",
  weight: "",
  price: "",
  category: "Chicken",
  image: "",
};

/** All state/query/mutation logic for VendorMeatMenu.tsx (work queue item #18). */
export function useVendorMeatMenu() {
  const queryClient = useQueryClient();
  const vendorData = JSON.parse(localStorage.getItem("vendor_data") || "{}");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState(blankItem);

  // Fetch ALL items (available + unavailable)
  const { data: menu, isLoading } = useQuery({
    queryKey: ["meat-menu-vendor", vendorData._id],
    queryFn: () => adminFetch<MeatItem[]>(`/meat/vendor-menu/${vendorData._id}`),
    enabled: !!vendorData._id,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ itemId, isAvailable }: { itemId: string; isAvailable: boolean }) =>
      adminFetch(`/meat/items/${itemId}/availability`, {
        method: "PUT",
        body: JSON.stringify({ isAvailable }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meat-menu-vendor"] });
      toast.success("Availability updated");
    },
    onError: () => toast.error("Failed to update availability"),
  });

  const priceMutation = useMutation({
    mutationFn: ({ itemId, price }: { itemId: string; price: number }) =>
      adminFetch(`/meat/items/${itemId}/price`, {
        method: "PUT",
        body: JSON.stringify({ price }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meat-menu-vendor"] });
      toast.success("Price updated successfully");
      setEditingId(null);
    },
    onError: () => toast.error("Failed to update price"),
  });

  const startEditing = (item: MeatItem) => {
    setEditingId(item._id);
    setEditPrice(item.price.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditPrice("");
  };

  const savePrice = (itemId: string) => {
    const parsed = parseFloat(editPrice);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    priceMutation.mutate({ itemId, price: parsed });
  };

  return {
    menu,
    isLoading,
    editingId,
    editPrice,
    setEditPrice,
    isAddOpen,
    setIsAddOpen,
    newItem,
    setNewItem,
    isToggling: toggleMutation.isPending,
    isSavingPrice: priceMutation.isPending,
    toggleAvailability: (itemId: string, isAvailable: boolean) => toggleMutation.mutate({ itemId, isAvailable }),
    startEditing,
    cancelEditing,
    savePrice,
  };
}
