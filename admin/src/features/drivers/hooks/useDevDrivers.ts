import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import { toast } from "sonner";
import type { DevDriver } from "../devDriversTypes";

/** All state/query/mutation logic for DevDrivers.tsx (work queue item #18). */
export function useDevDrivers() {
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
      toast.success(res.message || "10 Dev Drivers seeded!");
      queryClient.invalidateQueries({ queryKey: ["admin-dev-drivers"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to seed dev drivers");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      adminFetch<{ message: string }>("/admin/dev-drivers", {
        method: "DELETE",
      }),
    onSuccess: (res) => {
      toast.success(res.message || "All mock dev drivers deleted!");
      queryClient.invalidateQueries({ queryKey: ["admin-dev-drivers"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete dev drivers");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DevDriver> & { latitude?: number; longitude?: number } }) =>
      adminFetch<{ success: boolean }>(`/admin/dev-drivers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("Driver configuration updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-dev-drivers"] });
      setUpdatingId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update driver settings");
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
      toast.error("Please enter valid latitude and longitude numbers.");
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
