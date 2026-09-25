import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import type { DetailZoneOption, DriverDetailResponse, OrderChatMessage } from "../driverDetailTypes";

/** All state/query/mutation logic for DriverDetail.tsx (work queue item #6). */
export function useDriverDetail(id: string | undefined) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedOrderChat, setSelectedOrderChat] = useState<string | null>(null);
  const [isZoneOpen, setIsZoneOpen] = useState(false);
  const [zone1Id, setZone1Id] = useState("");
  const [zone2Id, setZone2Id] = useState("");

  const { data: chatMessages = [], isLoading: isChatLoading } = useQuery<OrderChatMessage[]>({
    queryKey: ["order-chat", selectedOrderChat],
    queryFn: () => adminFetch<OrderChatMessage[]>(`/admin/orders/${selectedOrderChat}/chat`),
    enabled: !!selectedOrderChat,
  });

  const { data: zonesResponse } = useQuery<{ data: DetailZoneOption[] }>({
    queryKey: ["admin-zones"],
    queryFn: () => adminFetch<{ data: DetailZoneOption[] }>("/zones"),
  });
  const zones = zonesResponse?.data || [];

  const { data, isLoading, error } = useQuery<DriverDetailResponse>({
    queryKey: ["admin-driver-detail", id],
    queryFn: () => adminFetch<DriverDetailResponse>(`/admin/drivers/${id}`),
    enabled: !!id,
  });

  useEffect(() => {
    if (data?.driver) {
      const pZones = data.driver.preferredZones || [];
      setZone1Id(pZones[0]?._id || data.driver.preferredZone?._id || "");
      setZone2Id(pZones[1]?._id || "");
    }
  }, [data]);

  const updateDriverMutation = useMutation({
    mutationFn: (updateData: Record<string, unknown>) => adminFetch(`/admin/drivers/${id}`, { method: "PUT", body: JSON.stringify(updateData) }),
    onSuccess: () => {
      toast.success(t("drivers.driverDossierUpdatedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["admin-driver-detail", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message || t("drivers.failedToUpdateDriver"));
    },
  });

  const deleteDriverMutation = useMutation({
    mutationFn: () => adminFetch(`/admin/drivers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success(t("drivers.driverRegistrationDeletedSuccessfully"));
      navigate("/drivers");
    },
    onError: (err: Error) => {
      toast.error(err.message || t("drivers.failedToDeleteDriver"));
    },
  });

  const handleDeleteClick = () => {
    if (confirm(t("drivers.confirmPermanentlyRemoveDriver"))) {
      deleteDriverMutation.mutate();
    }
  };

  const handleToggleBlock = (isBlocked: boolean) => updateDriverMutation.mutate({ isBlocked: !isBlocked });
  const handleToggleAadhaarVerified = (aadhaarVerified: boolean) => updateDriverMutation.mutate({ aadhaarVerified: !aadhaarVerified });
  const handleToggleBankVerified = (bankVerified: boolean) => updateDriverMutation.mutate({ bankVerified: !bankVerified });
  const handleApprove = () => updateDriverMutation.mutate({ onboardingStatus: "completed", aadhaarVerified: true, bankVerified: true });
  const handleReject = () => updateDriverMutation.mutate({ onboardingStatus: "rejected" });

  const handleConfirmZoneAssignment = () => {
    const selectedZones = [zone1Id, zone2Id].filter(Boolean);
    updateDriverMutation.mutate({ preferredZones: selectedZones, preferredZone: selectedZones[0] || null });
    setIsZoneOpen(false);
  };

  return {
    data,
    isLoading,
    error,
    zones,
    isZoneOpen,
    setIsZoneOpen,
    zone1Id,
    setZone1Id,
    zone2Id,
    setZone2Id,
    selectedOrderChat,
    setSelectedOrderChat,
    chatMessages,
    isChatLoading,
    isUpdating: updateDriverMutation.isPending,
    handleDeleteClick,
    handleToggleBlock,
    handleToggleAadhaarVerified,
    handleToggleBankVerified,
    handleApprove,
    handleReject,
    handleConfirmZoneAssignment,
    navigateToDrivers: () => navigate("/drivers"),
  };
}
