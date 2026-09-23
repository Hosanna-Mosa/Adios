import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import type { DevDriver } from "../devDriversTypes";

/** All state/query/mutation logic for DevDrivers.tsx (work queue item #18). */
export function useDevDrivers() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: drivers = [], isLoading } = useQuery<DevDriver[]>({
    queryKey: ["admin-dev-drivers"],
    queryFn: () => adminFetch<DevDriver[]>("/admin/dev-drivers"),
  });

  const seedMutation = useMutation({
    mutationFn: () =>
      adminFetch<{ message: string }>("/admin/dev-drivers/seed", {
        method: "POST",
      }),
    onSuccess: (res) => {
      toast.success(res.message || t("drivers.tenDevDriversSeeded"));
      queryClient.invalidateQueries({ queryKey: ["admin-dev-drivers"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || t("drivers.failedToSeedDevDrivers"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      adminFetch<{ message: string }>("/admin/dev-drivers", {
        method: "DELETE",
      }),
    onSuccess: (res) => {
      toast.success(res.message || t("drivers.allMockDevDriversDeleted"));
      queryClient.invalidateQueries({ queryKey: ["admin-dev-drivers"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || t("drivers.failedToDeleteDevDrivers"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DevDriver> & { latitude?: number; longitude?: number } }) =>
      adminFetch<{ success: boolean }>(`/admin/dev-drivers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success(t("drivers.driverConfigurationUpdatedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["admin-dev-drivers"] });
      setUpdatingId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || t("drivers.failedToUpdateDriverSettings"));
      setUpdatingId(null);
    },
  });

  const handleStatusToggle = (driver: DevDriver) => {
    const nextStatus = driver.status === "ONLINE" ? "OFFLINE" : "ONLINE";
    updateMutation.mutate({
      id: driver._id,
      data: { status: nextStatus },
    });
  };

  const handleVehicleChange = (driver: DevDriver, vehicleType: "bike" | "auto" | "car") => {
    updateMutation.mutate({
      id: driver._id,
      data: { vehicleType },
    });
  };

  const handleLocationSubmit = (driver: DevDriver, latStr: string, lngStr: string) => {
    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lngStr);
    if (isNaN(latitude) || isNaN(longitude)) {
      toast.error(t("drivers.pleaseEnterValidLatLng"));
      return;
    }
    setUpdatingId(driver._id);
    updateMutation.mutate({
      id: driver._id,
      data: { latitude, longitude },
    });
  };

  return {
    drivers,
    isLoading,
    updatingId,
    isSeeding: seedMutation.isPending,
    isDeleting: deleteMutation.isPending,
    seedDrivers: () => seedMutation.mutate(),
    deleteDrivers: () => deleteMutation.mutate(),
    handleStatusToggle,
    handleVehicleChange,
    handleLocationSubmit,
  };
}
