import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch, BASE_URL } from "@/lib/api-client";
import { appConfirm } from "@/lib/dialog";
import type { Banner, BannerFormData } from "../bannerTypes";

const EMPTY_FORM: BannerFormData = {
  title: "",
  description: "",
  imageUrl: "",
  targetUrl: "",
  itemType: "banner",
  position: "hero",
  displayOrder: 0,
  isActive: true,
  color1: "",
  color2: "",
};

/** All state/query/mutation logic for Banners.tsx (work queue item #13). */
export function useBanners() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(EMPTY_FORM);

  const { data: banners, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const data = await adminFetch("/admin/banners");
      return data as Banner[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: BannerFormData) => {
      if (editingBanner) {
        return adminFetch(`/admin/banners/${editingBanner._id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        return adminFetch("/admin/banners", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success(editingBanner ? t("catalog.bannerUpdated") : t("catalog.bannerCreated"));
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t("catalog.errorSavingBanner"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminFetch(`/admin/banners/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success(t("catalog.bannerDeleted"));
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (banner: Banner) => {
      return adminFetch(`/admin/banners/${banner._id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  const resetForm = () => {
    setEditingBanner(null);
    setFormData(EMPTY_FORM);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) resetForm();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const formDataObj = new FormData();
    // Banners only need one image, but endpoint expects array
    formDataObj.append("images", e.target.files[0]);

    try {
      const response = await fetch(`${BASE_URL}/food/upload`, {
        method: "POST",
        body: formDataObj,
      });

      const data = await response.json();
      if (response.ok && data.imageUrls && data.imageUrls.length > 0) {
        setFormData((prev) => ({ ...prev, imageUrl: data.imageUrls[0] }));
        toast.success(t("catalog.imageUploadedSuccessfully"));
      } else {
        toast.error(data.message || t("catalog.failedToUploadImage"));
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("catalog.errorDuringUpload"));
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || "",
      imageUrl: banner.imageUrl,
      targetUrl: banner.targetUrl || "",
      itemType: banner.itemType || "banner",
      position: banner.position || "hero",
      displayOrder: banner.displayOrder || 0,
      isActive: banner.isActive,
      color1: banner.color1 || "",
      color2: banner.color2 || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleDelete = async (id: string) => {
    if (await appConfirm({ title: t("catalog.confirmDeleteBanner"), tone: "destructive" })) {
      deleteMutation.mutate(id);
    }
  };

  return {
    banners,
    isLoading,
    isDialogOpen,
    setIsDialogOpen: handleDialogOpenChange,
    editingBanner,
    formData,
    setFormData,
    uploading,
    handleImageUpload,
    handleEdit,
    handleSubmit,
    isSaving: saveMutation.isPending,
    handleDelete,
    toggleStatus: (banner: Banner) => toggleStatusMutation.mutate(banner),
    isToggling: toggleStatusMutation.isPending,
  };
}
