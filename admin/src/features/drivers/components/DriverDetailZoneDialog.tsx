import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DetailZoneOption } from "../driverDetailTypes";

interface DriverDetailZoneDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  driverName?: string;
  zones: DetailZoneOption[];
  zone1Id: string;
  onZone1Change: (id: string) => void;
  zone2Id: string;
  onZone2Change: (id: string) => void;
  onConfirm: () => void;
  isSaving: boolean;
}

/** The "Assign Preferred Zones" dialog (up to 2 zones for this one driver). */
export function DriverDetailZoneDialog({ isOpen, onOpenChange, driverName, zones, zone1Id, onZone1Change, zone2Id, onZone2Change, onConfirm, isSaving }: DriverDetailZoneDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{t("drivers.assignPreferredZones")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 text-sm">
          <p className="text-muted-foreground text-xs">{t("drivers.selectUpTo2ZonesFor", { name: driverName, defaultValue: "Select up to 2 operational zones for driver {{name}}." })}</p>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">{t("drivers.zone1")}</label>
            <select className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={zone1Id} onChange={(e) => onZone1Change(e.target.value)}>
              <option value="">{t("drivers.noZoneSelected")}</option>
              {zones.map((zone) => (
                <option key={zone._id} value={zone._id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">{t("drivers.zone2")}</label>
            <select className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={zone2Id} onChange={(e) => onZone2Change(e.target.value)}>
              <option value="">{t("drivers.noZoneSelected")}</option>
              {zones.map((zone) => (
                <option key={zone._id} value={zone._id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>
          <Button className="w-full rounded-xl mt-2" onClick={onConfirm} disabled={isSaving}>
            {t("drivers.confirmZoneAssignment")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
