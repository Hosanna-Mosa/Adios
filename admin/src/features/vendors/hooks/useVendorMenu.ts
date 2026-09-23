import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch, BASE_URL } from "@/lib/api-client";
import type { FoodItem, FoodItemFormData } from "../vendorMenuTypes";

// Documents written before the flag existed have no `isAvailable` at all, so only an
// explicit false means sold out — matching the guard the customer app uses.
export const isInStock = (item: FoodItem) => item.isAvailable !== false;

const EMPTY_ITEM_FORM: FoodItemFormData = { name: "", description: "", price: "", category: "Main Course", isVeg: true, images: [] };

/** All state/query/mutation/dropzone logic for VendorMenu.tsx (work queue item #8). */
export function useVendorMenu() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const vendorData = JSON.parse(localStorage.getItem("vendor_data") || "{}");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const [newItem, setNewItem] = useState<FoodItemFormData>(EMPTY_ITEM_FORM);
  const [editItemForm, setEditItemForm] = useState<FoodItemFormData>(EMPTY_ITEM_FORM);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      const formData = new FormData();
      acceptedFiles.forEach((file) => formData.append("images", file));

      try {
        const response = await fetch(`${BASE_URL}/food/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (data.imageUrls) {
          if (isEditOpen) {
            setEditItemForm((prev) => ({ ...prev, images: [...prev.images, ...data.imageUrls] }));
          } else {
            setNewItem((prev) => ({ ...prev, images: [...prev.images, ...data.imageUrls] }));
          }
          toast.success(t("vendorMenu.imagesUploadedSuccessfully"));
        }
      } catch {
        toast.error(t("vendorMenu.failedToUploadImages"));
      } finally {
        setUploading(false);
      }
    },
    [isEditOpen, t]
  );

  const dropzone = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const removeImage = (index: number) => {
    if (isEditOpen) {
      setEditItemForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    } else {
      setNewItem((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    }
  };

  const menuQueryKey = ["vendor-menu", vendorData._id];

  const { data: menu, isLoading } = useQuery({
    queryKey: menuQueryKey,
    queryFn: () => adminFetch<FoodItem[]>(`/food/vendor/${vendorData._id}`),
    enabled: !!vendorData._id && vendorData.role !== "meat_vendor",
  });

  const addFoodMutation = useMutation({
    mutationFn: (data: FoodItemFormData) => adminFetch("/food", { method: "POST", body: JSON.stringify({ ...data, vendorId: vendorData._id }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-menu"] });
      toast.success(t("vendorMenu.foodItemAddedSuccessfully"));
      setIsAddOpen(false);
      setNewItem(EMPTY_ITEM_FORM);
    },
  });

  const deleteFoodMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/food/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-menu"] });
      toast.success(t("vendorMenu.itemRemovedFromMenu"));
    },
  });

  const updateFoodMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FoodItemFormData }) => adminFetch(`/food/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-menu"] });
      toast.success(t("vendorMenu.foodItemUpdatedSuccessfully"));
      setIsEditOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || t("vendorMenu.failedToUpdateFoodItem"));
    },
  });

  // Kept separate from updateFoodMutation: the card toggle must not close the edit
  // dialog, and the edit form must never carry isAvailable (it would clobber the flag).
  // Optimistic so the switch answers instantly, rolled back if the server refuses.
  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) => adminFetch<FoodItem>(`/food/items/${id}/availability`, { method: "PATCH", body: JSON.stringify({ isAvailable }) }),
    onMutate: async ({ id, isAvailable }) => {
      await queryClient.cancelQueries({ queryKey: menuQueryKey });
      const previousMenu = queryClient.getQueryData<FoodItem[]>(menuQueryKey);
      queryClient.setQueryData<FoodItem[]>(menuQueryKey, (current) => current?.map((item) => (item._id === id ? { ...item, isAvailable } : item)));
      return { previousMenu };
    },
    onSuccess: (_item, { isAvailable }) => {
      toast.success(isAvailable ? t("vendorMenu.dishBackInStock") : t("vendorMenu.dishMarkedOutOfStock"));
    },
    onError: (err: Error, _variables, context) => {
      if (context?.previousMenu) {
        queryClient.setQueryData(menuQueryKey, context.previousMenu);
      }
      toast.error(err.message || t("vendorMenu.failedToUpdateAvailability"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-menu"] });
    },
  });

  const handleEditClick = (item: FoodItem) => {
    setEditingItem(item);
    setEditItemForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      isVeg: item.isVeg,
      images: item.images,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editItemForm.name || !editItemForm.price) {
      toast.error(t("vendorMenu.pleaseEnterNameAndPrice"));
      return;
    }
    updateFoodMutation.mutate({ id: editingItem._id, data: editItemForm });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) {
      toast.error(t("vendorMenu.pleaseEnterNameAndPrice"));
      return;
    }
    if (newItem.images.length === 0) {
      toast.error(t("vendorMenu.pleaseUploadAtLeastOneImage"));
      return;
    }
    addFoodMutation.mutate(newItem);
  };

  return {
    vendorData,
    menu,
    isLoading,
    isAddOpen,
    setIsAddOpen,
    isEditOpen,
    setIsEditOpen,
    newItem,
    setNewItem,
    editItemForm,
    setEditItemForm,
    uploading,
    dropzone,
    removeImage,
    handleEditClick,
    handleEditSubmit,
    handleSubmit,
    isAdding: addFoodMutation.isPending,
    isUpdating: updateFoodMutation.isPending,
    deleteFood: deleteFoodMutation.mutate,
    toggleAvailability: toggleAvailabilityMutation.mutate,
    isTogglingId: toggleAvailabilityMutation.isPending ? toggleAvailabilityMutation.variables?.id : undefined,
  };
}
