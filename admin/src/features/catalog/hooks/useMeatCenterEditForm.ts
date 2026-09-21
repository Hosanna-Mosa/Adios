import { useState } from "react";
import { hasWeeklyHours, toHoursDraft, toWeeklyHours } from "@/components/shared/hoursUtils";
import type { HoursDraft } from "@/components/shared/hoursUtils";
import type { EditMeatCenterForm, MeatCenter } from "../meatCenterTypes";

const EMPTY_FORM: EditMeatCenterForm = { name: "", phone: "", address: "", isManuallyClosed: false };

interface UpdateCenterMutation {
  mutate: (variables: { id: string; data: Partial<MeatCenter> }, options?: { onSuccess?: () => void }) => void;
  isPending: boolean;
}

/**
 * The "Edit Meat Center" dialog: details form + the weekly-hours editor.
 * Split out from useMeatCentersList per "do not create one giant
 * unmanageable hook" -- takes updateCenterMutation as a dependency since
 * edit-submit uses the same shared mutation the View dialog's toggle does.
 *
 * The original page's single shared mutation always closed the Edit
 * dialog on success, even when the update came from the View dialog's
 * toggle -- harmless there since the Edit dialog isn't open at the same
 * time. Same fix as useVendorEditForm (item #4): a per-call onSuccess
 * (fires in addition to the hook-level one in useMeatCentersList) closes
 * this dialog only when *this* submission succeeds -- closing
 * unconditionally on submit, before the server responds, would also close
 * it on a failed update, which the original never did.
 */
export function useMeatCenterEditForm(updateCenterMutation: UpdateCenterMutation) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<MeatCenter | null>(null);
  const [editForm, setEditForm] = useState<EditMeatCenterForm>(EMPTY_FORM);

  // Kept beside editForm rather than inside it: a centre with no schedule must stay
  // "always open", so the week is only written when the admin explicitly turns it on.
  const [editHoursEnabled, setEditHoursEnabled] = useState(false);
  const [editHours, setEditHours] = useState<HoursDraft>(() => toHoursDraft());

  const handleEditClick = (center: MeatCenter) => {
    setEditingCenter(center);
    setEditForm({
      name: center.name,
      phone: center.phone,
      address: center.address,
      isManuallyClosed: center.isManuallyClosed === true,
    });
    setEditHoursEnabled(hasWeeklyHours(center.openingHours));
    setEditHours(toHoursDraft(center.openingHours));
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCenter) return;
    updateCenterMutation.mutate(
      {
        id: editingCenter._id,
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
    isSaving: updateCenterMutation.isPending,
  };
}
