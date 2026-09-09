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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {isEditing ? "Edit Zone Assignment" : "Assign Driver to Zone"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!isEditing && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Select Driver</label>
              <Select value={selectedDriverId} onValueChange={onSelectDriver}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Choose a driver..." />
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
            <label className="text-xs font-bold text-muted-foreground uppercase">Select Zone</label>
            <Select value={selectedZoneId || "none"} onValueChange={(val) => onSelectZone(val === "none" ? "" : val)}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Select Zone..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="none">No Zone Assigned</SelectItem>
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
              Cancel
            </Button>
            <Button onClick={onConfirm} className="rounded-xl">
              {isEditing ? "Save Changes" : "Assign Zone"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
