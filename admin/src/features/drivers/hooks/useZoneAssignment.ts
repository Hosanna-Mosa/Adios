import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api-client";
import type { AdminDriver, AdminZone } from "../types";

/**
 * Zone Assignments tab state for Drivers.tsx: the zones list, the
 * assign/edit dialog, and the assign/unassign mutation. Split out from
 * useDriversList per the plan's "organize related state logically" rule
 * rather than folded into one hook for the whole page.
 */
export function useZoneAssignment() {
  const queryClient = useQueryClient();
  const [isAssignZoneOpen, setIsAssignZoneOpen] = useState(false);
  const [selectedDriverForZone, setSelectedDriverForZone] = useState<string>("");
  const [selectedZoneForDriver, setSelectedZoneForDriver] = useState<string>("");
  const [isEditingAssignment, setIsEditingAssignment] = useState(false);

  const { data: zonesData } = useQuery({
    queryKey: ["admin", "zones"],
    queryFn: () => adminFetch<{ data: AdminZone[] }>("/zones"),
  });
  const zonesList = zonesData?.data || [];

  // Same endpoint/callback shape as useDriversList's updateDriverMutation
  // (used there for the dossier's Aadhaar/Bank/DL verification actions).
  // Kept as a separate instance per hook rather than one shared mutation,
  // per "organize related state logically" -- but its onSuccess text is
  // intentionally identical, because the original single shared mutation's
  // hook-level onSuccess ("Driver dossier updated successfully") always
  // fired before handleAssignZone's own per-call onSuccess toast. Splitting
  // the mutation must not drop that first toast.
  const updateDriverMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminDriver> }) =>
      adminFetch(`/admin/drivers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
      toast.success("Driver dossier updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update driver dossier");
    },
  });

  const handleAssignZone = (driverId: string, zoneId: string | null) => {
    updateDriverMutation.mutate(
      { id: driverId, data: { preferredZone: zoneId } },
      {
        onSuccess: () => {
          toast.success(zoneId ? "Zone assigned successfully" : "Zone unassigned successfully");
          queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
        },
      }
    );
  };

  const openAssignDialog = () => {
    setSelectedDriverForZone("");
    setSelectedZoneForDriver("");
    setIsEditingAssignment(false);
    setIsAssignZoneOpen(true);
  };

  const openEditDialog = (driverId: string, currentZoneId: string) => {
    setSelectedDriverForZone(driverId);
    setSelectedZoneForDriver(currentZoneId);
    setIsEditingAssignment(true);
    setIsAssignZoneOpen(true);
  };

  const handleConfirmAssign = () => {
    if (!selectedDriverForZone) {
      toast.error("Please select a driver");
      return;
    }
    handleAssignZone(selectedDriverForZone, selectedZoneForDriver || null);
    setIsAssignZoneOpen(false);
  };

  return {
    zonesList,
    isAssignZoneOpen,
    setIsAssignZoneOpen,
    selectedDriverForZone,
    setSelectedDriverForZone,
    selectedZoneForDriver,
    setSelectedZoneForDriver,
    isEditingAssignment,
    openAssignDialog,
    openEditDialog,
    handleAssignZone,
    handleConfirmAssign,
  };
}
