import { useState } from "react";
import { hasWeeklyHours, toHoursDraft, toWeeklyHours } from "@/components/shared/hoursUtils";
import type { EditVendorForm, HoursDraft, Vendor } from "../types";

const EMPTY_FORM: EditVendorForm = { name: "", email: "", phone: "", isPureVeg: false, address: "", isManuallyClosed: false };

interface UpdateVendorMutation {
  mutate: (variables: { id: string; data: Partial<Vendor> }, options?: { onSuccess?: () => void }) => void;
  isPending: boolean;
}

/**
 * The "Edit Restaurant" dialog: details form + the weekly-hours editor.
 * Split out from useVendorsList per "do not create one giant unmanageable
 * hook" -- takes updateVendorMutation (from that hook) as a dependency
 * since edit-submit uses the same shared mutation the View dialog's
 * actions do.
 */
export function useVendorEditForm(updateVendorMutation: UpdateVendorMutation) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editForm, setEditForm] = useState<EditVendorForm>(EMPTY_FORM);

  // Kept beside editForm rather than inside it: an outlet with no schedule must stay
  // "always open", so the week is only written when the admin explicitly turns it on.
  const [editHoursEnabled, setEditHoursEnabled] = useState(false);
  const [editHours, setEditHours] = useState<HoursDraft>(() => toHoursDraft());

  const handleEditClick = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setEditForm({
      name: vendor.name,
      email: vendor.email || "",
      phone: vendor.phone,
      isPureVeg: vendor.isPureVeg,
      address: vendor.address,
      isManuallyClosed: vendor.isManuallyClosed === true,
    });
    setEditHoursEnabled(hasWeeklyHours(vendor.openingHours));
    setEditHours(toHoursDraft(vendor.openingHours));
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;
    updateVendorMutation.mutate(
      {
        id: editingVendor._id,
        // An empty object clears the schedule, which the server reads as "always open".
        data: { ...editForm, openingHours: editHoursEnabled ? toWeeklyHours(editHours) : {} },
      },
      { onSuccess: () => setIsEditOpen(false) }
    );
  };

  return {
    isEditOpen,
    setIsEditOpen,
    editForm,
    setEditForm,
    editHoursEnabled,
    setEditHoursEnabled,
    editHours,
    setEditHours,
    handleEditClick,
    handleEditSubmit,
    isSaving: updateVendorMutation.isPending,
  };
}
