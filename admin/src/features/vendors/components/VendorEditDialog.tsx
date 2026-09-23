import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OpeningHoursEditor } from "@/components/shared/OpeningHoursEditor";
import type { EditVendorForm, HoursDraft } from "../types";

interface VendorEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: EditVendorForm;
  onChange: (form: EditVendorForm) => void;
  editHoursEnabled: boolean;
  onHoursEnabledChange: (enabled: boolean) => void;
  editHours: HoursDraft;
  onHoursChange: (hours: HoursDraft) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
}

/** The "Edit Restaurant" dialog. */
export function VendorEditDialog({
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
}: VendorEditDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t("catalog.editRestaurant")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("catalog.name")}</label>
            <Input value={editForm.name} onChange={(e) => onChange({ ...editForm, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("catalog.email")}</label>
            <Input type="email" value={editForm.email} onChange={(e) => onChange({ ...editForm, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("catalog.phone")}</label>
            <Input value={editForm.phone} onChange={(e) => onChange({ ...editForm, phone: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("catalog.address")}</label>
            <Input value={editForm.address} onChange={(e) => onChange({ ...editForm, address: e.target.value })} required />
          </div>
          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="editIsPureVeg"
              checked={editForm.isPureVeg}
              onChange={(e) => onChange({ ...editForm, isPureVeg: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="editIsPureVeg" className="text-sm font-medium cursor-pointer select-none">
              {t("catalog.isPureVeg")}
            </label>
          </div>

          <div className="space-y-3 rounded-2xl border border-border p-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editIsManuallyClosed"
                checked={editForm.isManuallyClosed}
                onChange={(e) => onChange({ ...editForm, isManuallyClosed: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="editIsManuallyClosed" className="text-sm font-medium cursor-pointer select-none">
                {t("catalog.temporarilyClosedDesc")}
              </label>
            </div>

            <div className="flex items-center gap-2 border-t border-border pt-3">
              <input
                type="checkbox"
                id="editHoursEnabled"
                checked={editHoursEnabled}
                onChange={(e) => onHoursEnabledChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="editHoursEnabled" className="text-sm font-medium cursor-pointer select-none">
                {t("catalog.setWeeklyOpeningHours")}
              </label>
            </div>

            {editHoursEnabled ? (
              <OpeningHoursEditor draft={editHours} onChange={onHoursChange} />
            ) : (
              <p className="text-xs text-muted-foreground">{t("catalog.withoutScheduleOpenAroundClockDesc")}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? t("catalog.updatingEllipsis") : t("vendorMenu.saveChanges")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
