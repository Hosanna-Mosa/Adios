import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BASE_URL } from "@/lib/api-client";
import { authHeader } from "./useRestaurantMenuList";
import { uploadMenuItemImage } from "./uploadMenuItemImage";
import type { MenuItem, RestaurantForm } from "../restaurantMenuTypes";

const EMPTY_FORM: RestaurantForm = { name: "", email: "", phone: "", address: "", isPureVeg: false };

/**
 * The "Add Restaurant Menu" 3-step wizard: restaurant details, bulk menu
 * image upload, then AI-OCR-extracted menu review/edit. Split out from
 * useRestaurantMenuList per "do not create one giant unmaintainable hook".
 */
export function useRestaurantAddFlow() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [restaurantForm, setRestaurantForm] = useState<RestaurantForm>(EMPTY_FORM);
  const [menuImages, setMenuImages] = useState<File[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedMenu, setExtractedMenu] = useState<MenuItem[]>([]);

  const resetAddFlow = () => {
    setStep(1);
    setRestaurantForm(EMPTY_FORM);
    setMenuImages([]);
    setExtractedMenu([]);
  };

  const handleAddOpenChange = (open: boolean) => {
    setIsAddOpen(open);
    if (!open) resetAddFlow();
  };

  const handleAddRestaurantNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantForm.name || !restaurantForm.phone || !restaurantForm.address) {
      toast.error("Please fill in name, phone, and address");
      return;
    }
    setStep(2);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMenuImages(Array.from(e.target.files));
    }
  };

  const handleExtractMenu = async () => {
    if (menuImages.length === 0) {
      toast.error("Please upload at least one menu image");
      return;
    }

    setIsExtracting(true);
    const formData = new FormData();
    menuImages.forEach((img) => {
      formData.append("images", img);
    });

    try {
      const response = await fetch(`${BASE_URL}/food/restaurant-menu/extract`, {
        method: "POST",
        headers: {
          Authorization: authHeader(),
          // Note: boundary will be automatically set by the browser
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to extract menu");
      }

      const data = await response.json();
      setExtractedMenu(data.items || []);
      toast.success("Menu items extracted successfully!");
      setStep(3);
    } catch (err) {
      toast.error((err as Error).message || "OCR Extraction failed");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleItemImageUpload = async (file: File, index: number) => {
    try {
      const url = await uploadMenuItemImage(file);
      if (url) {
        const updated = [...extractedMenu];
        updated[index].images = [url];
        setExtractedMenu(updated);
        toast.success("Photo uploaded successfully");
      }
    } catch (err) {
      toast.error((err as Error).message || "Upload failed");
    }
  };

  const saveNewMutation = useMutation({
    mutationFn: async (body: RestaurantForm & { items: MenuItem[] }) => {
      const response = await fetch(`${BASE_URL}/food/restaurant-menu/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authHeader() },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Failed to save restaurant");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants-menu"] });
      toast.success("Restaurant and menu created successfully!");
      setIsAddOpen(false);
      resetAddFlow();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Save failed");
    },
  });

  const handleSaveRestaurant = () => {
    saveNewMutation.mutate({ ...restaurantForm, items: extractedMenu });
  };

  return {
    isAddOpen,
    setIsAddOpen: handleAddOpenChange,
    step,
    setStep,
    restaurantForm,
    setRestaurantForm,
    menuImages,
    setMenuImages,
    isExtracting,
    extractedMenu,
    setExtractedMenu,
    handleAddRestaurantNext,
    handleImageChange,
    handleExtractMenu,
    handleItemImageUpload,
    handleSaveRestaurant,
    isSaving: saveNewMutation.isPending,
  };
}
