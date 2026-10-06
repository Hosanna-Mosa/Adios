import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { appConfirm } from "@/lib/dialog";
import type { MeatCenter } from "../meatCenterTypes";

/**
 * The meat-center list/delete state for MeatCenters.tsx (work queue item
 * #5), plus its View Details dialog -- kept here rather than its own hook
 * because it shares this hook's `updateCenterMutation` and the vendor-
 * resync effect below, the same reasoning as useVendorsList (item #4).
 * MeatCenters' View dialog is simpler than Vendors' (no commission rate,
 * no legal info, no approve/reject), so there's less here than the
 * Vendors equivalent.
 */
export function useMeatCentersList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [viewingCenter, setViewingCenter] = useState<MeatCenter | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const { data: centers, isLoading } = useQuery({
    queryKey: ["meat-centers"],
    queryFn: () => adminFetch<MeatCenter[]>("/meat/nearby?lat=0&lng=0&all=true"),
  });

  // The View dialog holds a snapshot, so after an availability toggle refetches the list
  // it would keep rendering the openState it was opened with. Re-sync it from the fresh row.
  useEffect(() => {
    if (!isViewOpen) return;
    setViewingCenter((current) => {
      if (!current) return current;
      return (centers || []).find((c) => c._id === current._id) || current;
    });
  }, [centers, isViewOpen]);

  const deleteCenterMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/meat/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meat-centers"] });
      toast.success(t("catalog.meatCenterDeletedSuccessfully"));
    },
    onError: (err: Error) => {
      toast.error(err.message || t("catalog.failedToDeleteMeatCenter"));
    },
  });

  const updateCenterMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MeatCenter> }) => adminFetch(`/meat/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meat-centers"] });
      toast.success(t("catalog.meatCenterUpdatedSuccessfully"));
    },
    onError: (err: Error) => {
      toast.error(err.message || t("catalog.failedToUpdateMeatCenter"));
    },
  });

  const handleDeleteClick = async (center: MeatCenter) => {
    if (await appConfirm({ title: t("catalog.confirmDeleteVendor", { name: center.name, defaultValue: "Are you sure you want to delete {{name}}?" }), tone: "destructive" })) {
      deleteCenterMutation.mutate(center._id);
    }
  };

  const handleViewClick = (center: MeatCenter) => {
    setViewingCenter(center);
    setIsViewOpen(true);
  };

  const handleToggleManuallyClosed = () => {
    if (!viewingCenter) return;
    const nextClosed = !viewingCenter.isManuallyClosed;
    updateCenterMutation.mutate({ id: viewingCenter._id, data: { isManuallyClosed: nextClosed } });
    setViewingCenter({ ...viewingCenter, isManuallyClosed: nextClosed });
  };

  return {
    centers,
    isLoading,
    handleDeleteClick,
    updateCenterMutation,
    isViewOpen,
    setIsViewOpen,
    viewingCenter,
    handleViewClick,
    handleToggleManuallyClosed,
  };
}
