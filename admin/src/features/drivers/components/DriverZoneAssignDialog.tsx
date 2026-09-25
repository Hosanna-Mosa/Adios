import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { AdminDriver, AdminZone } from "../types";

interface DriverZoneAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  drivers: AdminDriver[];
  zonesList: AdminZone[];
  selectedDriverId: string;
  onSelectDriver: (id: string) => void;
  selectedZoneId: string;
  onSelectZone: (id: string) => void;
  onConfirm: () => void;
}

/** Assign/Edit a driver's zone. */
export function DriverZoneAssignDialog({
  open,
  onOpenChange,
  isEditing,
  drivers,
  zonesList,
  selectedDriverId,
  onSelectDriver,
  selectedZoneId,
  onSelectZone,
  onConfirm,
}: DriverZoneAssignDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {isEditing ? t("drivers.editZoneAssignment") : t("drivers.assignDriverToZone")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!isEditing && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">{t("drivers.selectDriver")}</label>
              <Select value={selectedDriverId} onValueChange={onSelectDriver}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder={t("drivers.chooseADriverEllipsis")} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {drivers.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.user?.name} ({d.user?.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t("drivers.selectZone")}</label>
            <Select value={selectedZoneId || "none"} onValueChange={(val) => onSelectZone(val === "none" ? "" : val)}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder={t("drivers.selectZoneEllipsis")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="none">{t("drivers.noZoneAssigned")}</SelectItem>
                {zonesList.map((z) => (
                  <SelectItem key={z._id} value={z._id}>
                    {z.name} ({z.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              {t("common.cancel")}
            </Button>
            <Button onClick={onConfirm} className="rounded-xl">
              {isEditing ? t("vendorMenu.saveChanges") : t("drivers.assignZone")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
