import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { BASE_URL } from "@/lib/api-client";
import { authHeader } from "./useRestaurantMenuList";
import { uploadMenuItemImage } from "./uploadMenuItemImage";
import type { MenuItem, Restaurant, RestaurantForm } from "../restaurantMenuTypes";

const EMPTY_FORM: RestaurantForm = { name: "", email: "", phone: "", address: "", isPureVeg: false };

interface UseRestaurantEditFlowOptions {
  fetchMenu: (restaurantId: string) => Promise<MenuItem[] | null>;
}

/**
 * The "Edit Restaurant & Menu" dialog: the restaurant's editable details
 * plus its editable menu-items table. Split out from useRestaurantMenuList
 * per "do not create one giant unmaintainable hook" -- takes fetchMenu
 * (from that hook) as a dependency since both flows load a restaurant's
 * menu the same way.
 */
export function useRestaurantEditFlow({ fetchMenu }: UseRestaurantEditFlowOptions) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [editForm, setEditForm] = useState<RestaurantForm>(EMPTY_FORM);
  const [editMenu, setEditMenu] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  const handleEditClick = async (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setEditForm({
      name: restaurant.name,
      email: restaurant.email,
      phone: restaurant.phone,
      address: restaurant.address,
      isPureVeg: restaurant.isPureVeg,
    });
    setIsLoadingMenu(true);
    const menu = await fetchMenu(restaurant._id);
    setEditMenu(menu || []);
    setIsLoadingMenu(false);
    setIsEditOpen(true);
  };

  const editMutation = useMutation({
    mutationFn: async (data: { id: string; body: RestaurantForm & { items: MenuItem[] } }) => {
      const response = await fetch(`${BASE_URL}/food/restaurant-menu/restaurants/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: authHeader() },
        body: JSON.stringify(data.body),
      });
      if (!response.ok) throw new Error(t("catalog.failedToUpdateRestaurant"));
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants-menu"] });
      toast.success(t("catalog.restaurantAndMenuUpdatedSuccessfully"));
      setIsEditOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || t("catalog.updateFailed"));
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;
    editMutation.mutate({ id: selectedRestaurant._id, body: { ...editForm, items: editMenu } });
  };

  const handleItemImageUpload = async (file: File, index: number) => {
    try {
      const url = await uploadMenuItemImage(file);
      if (url) {
        const updated = [...editMenu];
        updated[index].images = [url];
        setEditMenu(updated);
        toast.success(t("catalog.photoUploadedSuccessfully"));
      }
    } catch (err) {
      toast.error((err as Error).message || t("catalog.uploadFailed"));
    }
  };

  return {
    isEditOpen,
    setIsEditOpen,
    editForm,
    setEditForm,
    editMenu,
    setEditMenu,
    isLoadingMenu,
    handleEditClick,
    handleEditSubmit,
    handleItemImageUpload,
    isSaving: editMutation.isPending,
  };
}
