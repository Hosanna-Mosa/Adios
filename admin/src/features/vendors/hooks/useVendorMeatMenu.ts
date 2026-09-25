import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      toast.success(t("vendorMeatMenu.availabilityUpdated"));
    },
    onError: () => toast.error(t("vendorMenu.failedToUpdateAvailability")),
  });

  const priceMutation = useMutation({
    mutationFn: ({ itemId, price }: { itemId: string; price: number }) =>
      adminFetch(`/meat/items/${itemId}/price`, {
        method: "PUT",
        body: JSON.stringify({ price }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meat-menu-vendor"] });
      toast.success(t("vendorMeatMenu.priceUpdatedSuccessfully"));
      setEditingId(null);
    },
    onError: () => toast.error(t("vendorMeatMenu.failedToUpdatePrice")),
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
      toast.error(t("vendorMeatMenu.pleaseEnterValidPrice"));
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
