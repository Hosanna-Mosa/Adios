import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OpeningHoursEditor } from "@/components/shared/OpeningHoursEditor";
import type { HoursDraft } from "@/components/shared/hoursUtils";
import type { EditMeatCenterForm } from "../meatCenterTypes";

interface MeatCenterEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: EditMeatCenterForm;
  onChange: (form: EditMeatCenterForm) => void;
  editHoursEnabled: boolean;
  onHoursEnabledChange: (enabled: boolean) => void;
  editHours: HoursDraft;
  onHoursChange: (hours: HoursDraft) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
}

/** The "Edit Meat Center" dialog. */
export function MeatCenterEditDialog({
  isOpen,
  onOpenChange,
  editForm,
  onChange,
  editHoursEnabled,
  onHoursEnabledChange,
  editHours,
  onHoursChange,
  onSubmit,
  isSaving,
}: MeatCenterEditDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Meat Center</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={editForm.name} onChange={(e) => onChange({ ...editForm, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input value={editForm.phone} onChange={(e) => onChange({ ...editForm, phone: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Input value={editForm.address} onChange={(e) => onChange({ ...editForm, address: e.target.value })} required />
          </div>

          <div className="space-y-3 rounded-2xl border border-border p-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editCenterManuallyClosed"
                checked={editForm.isManuallyClosed}
                onChange={(e) => onChange({ ...editForm, isManuallyClosed: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="editCenterManuallyClosed" className="text-sm font-medium cursor-pointer select-none">
                Temporarily closed (stop taking orders)
              </label>
            </div>

            <div className="flex items-center gap-2 border-t border-border pt-3">
              <input
                type="checkbox"
                id="editCenterHoursEnabled"
                checked={editHoursEnabled}
                onChange={(e) => onHoursEnabledChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="editCenterHoursEnabled" className="text-sm font-medium cursor-pointer select-none">
                Set weekly opening hours
              </label>
            </div>

            {editHoursEnabled ? (
              <OpeningHoursEditor draft={editHours} onChange={onHoursChange} />
            ) : (
              <p className="text-xs text-muted-foreground">Without a schedule this centre is treated as open around the clock.</p>
            )}
          </div>

          <Button type="submit" className="w-full mt-4" disabled={isSaving}>
            {isSaving ? "Updating..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
