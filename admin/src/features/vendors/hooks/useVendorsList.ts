import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { appConfirm } from "@/lib/dialog";
import type { Vendor } from "../types";

const ITEMS_PER_PAGE = 8;

/**
 * The vendor list/search/filter/pagination/delete state for Vendors.tsx
 * (work queue item #4), plus the View Details dialog -- kept here rather
 * than its own hook because it shares this hook's `updateVendorMutation`
 * and the vendor-list re-sync effect below, not because "do not create one
 * giant hook" was abandoned: the Edit flow, which doesn't share either of
 * those, is its own hook (useVendorEditForm).
 */
export function useVendorsList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filterSearch, setFilterSearchState] = useState("");
  const [filterStatus, setFilterStatusState] = useState("all");
  const [filterVeg, setFilterVegState] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [commRate, setCommRate] = useState<number>(10);

  const { data: vendors, isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => adminFetch<Vendor[]>("/vendors/nearby?lat=0&lng=0"), // Default fetch
  });

  // The View dialog holds a snapshot, so after an availability toggle refetches the list
  // it would keep rendering the openState it was opened with. Re-sync it from the fresh row.
  useEffect(() => {
    if (!isViewOpen) return;
    setViewingVendor((current) => {
      if (!current) return current;
      return (vendors || []).find((v) => v._id === current._id) || current;
    });
  }, [vendors, isViewOpen]);

  const deleteVendorMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/vendors/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success(t("catalog.vendorDeletedSuccessfully"));
    },
    onError: (err: Error) => {
      toast.error(err.message || t("catalog.failedToDeleteVendor"));
    },
  });

  // The original page's single shared mutation always also closed the
  // Edit dialog on success (setIsEditOpen(false)) -- harmless when the
  // update came from this hook's own View dialog actions, since the Edit
  // dialog isn't open at the same time. This hook doesn't need to know
  // the Edit dialog exists: useVendorEditForm adds its own per-call
  // onSuccess (React Query fires it in addition to this one, same as the
  // Zones commit's handleAssignZone) to close its own dialog.
  const updateVendorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vendor> }) => adminFetch(`/vendors/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success(t("catalog.vendorUpdatedSuccessfully"));
    },
    onError: (err: Error) => {
      toast.error(err.message || t("catalog.failedToUpdateVendor"));
    },
  });

  const handleDeleteClick = async (vendor: Vendor) => {
    if (await appConfirm({ title: t("catalog.confirmDeleteVendor", { name: vendor.name, defaultValue: "Are you sure you want to delete {{name}}?" }), tone: "destructive" })) {
      deleteVendorMutation.mutate(vendor._id);
    }
  };

  const handleViewClick = (vendor: Vendor) => {
    setViewingVendor(vendor);
    setCommRate(vendor.commissionRate || 10);
    setIsViewOpen(true);
  };

  const handleToggleManuallyClosed = () => {
    if (!viewingVendor) return;
    const nextClosed = !viewingVendor.isManuallyClosed;
    updateVendorMutation.mutate({ id: viewingVendor._id, data: { isManuallyClosed: nextClosed } });
    setViewingVendor({ ...viewingVendor, isManuallyClosed: nextClosed });
  };

  const handleSaveCommission = () => {
    if (!viewingVendor) return;
    updateVendorMutation.mutate({ id: viewingVendor._id, data: { commissionRate: commRate } });
    setViewingVendor({ ...viewingVendor, commissionRate: commRate });
  };

  const handleApprove = () => {
    if (!viewingVendor) return;
    updateVendorMutation.mutate({ id: viewingVendor._id, data: { onboardingStatus: "approved" } });
    setViewingVendor({ ...viewingVendor, onboardingStatus: "approved" });
  };

  const handleReject = () => {
    if (!viewingVendor) return;
    updateVendorMutation.mutate({ id: viewingVendor._id, data: { onboardingStatus: "rejected" } });
    setViewingVendor({ ...viewingVendor, onboardingStatus: "rejected" });
  };

  const setFilterSearch = (value: string) => {
    setFilterSearchState(value);
    setCurrentPage(1);
  };
  const setFilterStatus = (value: string) => {
    setFilterStatusState(value);
    setCurrentPage(1);
  };
  const setFilterVeg = (value: string) => {
    setFilterVegState(value);
    setCurrentPage(1);
  };

  const filteredVendors = (vendors || []).filter((vendor) => {
    const searchLower = filterSearch.toLowerCase();
    const matchesSearch = vendor.name.toLowerCase().includes(searchLower) || vendor.address.toLowerCase().includes(searchLower);
    const status = vendor.onboardingStatus || "draft";
    const matchesStatus = filterStatus === "all" || status === filterStatus;
    const matchesVeg = filterVeg === "all" || (filterVeg === "veg" && vendor.isPureVeg) || (filterVeg === "nonveg" && !vendor.isPureVeg);
    return matchesSearch && matchesStatus && matchesVeg;
  });

  const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedVendors = filteredVendors.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return {
    vendors,
    isLoading,
    filterSearch,
    setFilterSearch,
    filterStatus,
    setFilterStatus,
    filterVeg,
    setFilterVeg,
    currentPage: safePage,
    setCurrentPage,
    totalPages,
    filteredVendors,
    paginatedVendors,
    handleDeleteClick,
    updateVendorMutation,
    isViewOpen,
    setIsViewOpen,
    viewingVendor,
    setViewingVendor,
    commRate,
    setCommRate,
    handleViewClick,
    handleToggleManuallyClosed,
    handleSaveCommission,
    handleApprove,
    handleReject,
  };
}
