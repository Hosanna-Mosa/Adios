import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch, BASE_URL } from "@/lib/api-client";
import { appConfirm } from "@/lib/dialog";
import type { Offer, OfferFormData, OfferRestaurantOption } from "../offerTypes";

const EMPTY_FORM: OfferFormData = {
  vendor: "",
  title: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  maxDiscount: "",
  minOrderValue: "",
  couponCode: "",
  imageUrl: "",
  startDate: "",
  endDate: "",
  isActive: true,
  displayOrder: "0",
};

const ITEMS_PER_PAGE = 8;

/** "YYYY-MM-DD" for a date input, in the admin's local time zone. */
const toDateInput = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const toNumberOrNull = (value: string) => (value.trim() === "" ? null : Number(value));

/** Form state -> request body. A bare date starts at the start of the day and ends at its end (local time). */
const toPayload = (form: OfferFormData) => ({
  vendor: form.vendor,
  title: form.title.trim(),
  description: form.description.trim(),
  discountType: form.discountType,
  discountValue: Number(form.discountValue),
  maxDiscount: form.discountType === "PERCENTAGE" ? toNumberOrNull(form.maxDiscount) : null,
  minOrderValue: toNumberOrNull(form.minOrderValue),
  couponCode: form.couponCode.trim().toUpperCase(),
  imageUrl: form.imageUrl.trim(),
  startDate: form.startDate ? new Date(`${form.startDate}T00:00:00`).toISOString() : null,
  endDate: form.endDate ? new Date(`${form.endDate}T23:59:59`).toISOString() : null,
  isActive: form.isActive,
  displayOrder: Number(form.displayOrder) || 0,
});

/** All state/query/mutation logic for Offers.tsx. */
export function useOffers() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState<OfferFormData>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: offers = [], isLoading } = useQuery<Offer[]>({
    queryKey: ["admin-offers"],
    queryFn: () => adminFetch<Offer[]>("/admin/offers"),
  });

  // Same request (and query key) the Vendors page uses to list every restaurant.
  const { data: restaurants = [], isLoading: isLoadingRestaurants } = useQuery<OfferRestaurantOption[]>({
    queryKey: ["vendors"],
    queryFn: () => adminFetch<OfferRestaurantOption[]>("/vendors/nearby?lat=0&lng=0"),
  });

  const resetForm = () => {
    setEditingOffer(null);
    setFormData(EMPTY_FORM);
  };

  const saveMutation = useMutation({
    mutationFn: (body: ReturnType<typeof toPayload>) =>
      editingOffer
        ? adminFetch(`/admin/offers/${editingOffer._id}`, { method: "PUT", body: JSON.stringify(body) })
        : adminFetch("/admin/offers", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      toast.success(editingOffer ? t("offers.offerUpdated") : t("offers.offerCreated"));
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      toast.error(err.message || t("offers.failedToSaveOffer"));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (offer: Offer) =>
      adminFetch(`/admin/offers/${offer._id}`, { method: "PUT", body: JSON.stringify({ isActive: !offer.isActive }) }),
    onSuccess: () => {
      toast.success(t("offers.offerStatusUpdated"));
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || t("offers.failedToSaveOffer"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/admin/offers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success(t("offers.offerDeleted"));
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || t("offers.failedToDeleteOffer"));
    },
  });

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) resetForm();
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      vendor: offer.vendor?._id || "",
      title: offer.title,
      description: offer.description || "",
      discountType: offer.discountType,
      discountValue: String(offer.discountValue ?? ""),
      maxDiscount: offer.maxDiscount != null ? String(offer.maxDiscount) : "",
      minOrderValue: offer.minOrderValue != null ? String(offer.minOrderValue) : "",
      couponCode: offer.couponCode || "",
      imageUrl: offer.imageUrl || "",
      startDate: toDateInput(offer.startDate),
      endDate: toDateInput(offer.endDate),
      isActive: offer.isActive,
      displayOrder: String(offer.displayOrder ?? 0),
    });
    setIsDialogOpen(true);
  };

  // Same Cloudinary upload the Banners page uses (POST /food/upload, field "images").
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append("images", file);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${BASE_URL}/food/upload`, {
        method: "POST",
        body,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
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
      e.target.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(formData.discountValue);
    if (!formData.vendor) {
      toast.error(t("offers.pleaseSelectRestaurant"));
      return;
    }
    if (!formData.title.trim() || !Number.isFinite(value) || value <= 0) {
      toast.error(t("offers.pleaseEnterTitleAndDiscount"));
      return;
    }
    if (formData.discountType === "PERCENTAGE" && value > 100) {
      toast.error(t("offers.percentageTooHigh"));
      return;
    }
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      toast.error(t("offers.endBeforeStart"));
      return;
    }
    saveMutation.mutate(toPayload(formData));
  };

  const handleDelete = async (offer: Offer) => {
    if (
      await appConfirm({
        title: t("offers.confirmDeleteOffer", { title: offer.title, defaultValue: 'Delete the offer "{{title}}"?' }),
        tone: "destructive",
      })
    ) {
      deleteMutation.mutate(offer._id);
    }
  };

  const isExpired = (offer: Offer) => !!offer.endDate && new Date(offer.endDate) < new Date();
  const isScheduled = (offer: Offer) => !!offer.startDate && new Date(offer.startDate) > new Date();

  const totalPages = Math.ceil(offers.length / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOffers = offers.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return {
    offers,
    isLoading,
    restaurants,
    isLoadingRestaurants,
    isDialogOpen,
    setIsDialogOpen: handleDialogOpenChange,
    editingOffer,
    formData,
    setFormData,
    uploading,
    handleImageUpload,
    handleEdit,
    handleSubmit,
    isSaving: saveMutation.isPending,
    handleDelete,
    toggleStatus: (offer: Offer) => toggleMutation.mutate(offer),
    isExpired,
    isScheduled,
    currentPage: safePage,
    setCurrentPage,
    totalPages,
    paginatedOffers,
  };
}
