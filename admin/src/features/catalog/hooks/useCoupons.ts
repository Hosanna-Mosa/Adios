import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { appConfirm } from "@/lib/dialog";
import type { Coupon, NewCouponForm } from "../couponTypes";

const EMPTY_FORM: NewCouponForm = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 0,
  maxDiscount: 0,
  minOrderValue: 0,
  expiryDate: "",
};

const ITEMS_PER_PAGE = 8;

/** All state/query/mutation logic for Coupons.tsx (work queue item #16). */
export function useCoupons() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newCoupon, setNewCoupon] = useState<NewCouponForm>(EMPTY_FORM);

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ["admin-coupons"],
    queryFn: () => adminFetch<Coupon[]>("/admin/coupons"),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      adminFetch("/admin/coupons", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success(t("catalog.couponCreatedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      setIsAddOpen(false);
      setNewCoupon(EMPTY_FORM);
    },
    onError: (err: Error) => {
      toast.error(err.message || t("catalog.failedToCreateCoupon"));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/admin/coupons/${id}/toggle`, {
        method: "PUT",
      }),
    onSuccess: () => {
      toast.success(t("catalog.couponStatusUpdated"));
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || t("catalog.failedToUpdateStatus"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/admin/coupons/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success(t("catalog.couponDeletedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || t("catalog.failedToDeleteCoupon"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discountValue) {
      toast.error(t("catalog.pleaseEnterCodeAndDiscountValue"));
      return;
    }
    createMutation.mutate({
      ...newCoupon,
      code: newCoupon.code.toUpperCase(),
      maxDiscount: newCoupon.discountType === "PERCENTAGE" ? newCoupon.maxDiscount : undefined,
      // A bare "YYYY-MM-DD" is read as UTC midnight, so a coupon dated today would
      // already be past its expiry and never reach the app's offer list. Run it to
      // the end of the chosen day so "expires on" means "valid through".
      expiryDate: newCoupon.expiryDate ? new Date(`${newCoupon.expiryDate}T23:59:59`).toISOString() : undefined,
    });
  };

  const isExpired = (coupon: Coupon) => !!coupon.expiryDate && new Date(coupon.expiryDate) <= new Date();

  const handleDelete = async (id: string, code: string) => {
    if (await appConfirm({ title: t("catalog.confirmDeleteCoupon", { code, defaultValue: "Are you sure you want to delete coupon {{code}}?" }), tone: "destructive" })) {
      deleteMutation.mutate(id);
    }
  };

  const totalPages = Math.ceil(coupons.length / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCoupons = coupons.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return {
    coupons,
    isLoading,
    isAddOpen,
    setIsAddOpen,
    newCoupon,
    setNewCoupon,
    handleSubmit,
    isCreating: createMutation.isPending,
    isExpired,
    handleDelete,
    toggleStatus: (id: string) => toggleMutation.mutate(id),
    currentPage: safePage,
    setCurrentPage,
    totalPages,
    paginatedCoupons,
  };
}
