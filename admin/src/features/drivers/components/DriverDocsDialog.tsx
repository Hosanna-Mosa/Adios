import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DriverKycPanel } from "./DriverKycPanel";
import type { AdminDriver } from "../types";

interface DriverDocsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: AdminDriver | null;
  onToggleAadhaarVerified: () => void;
  onToggleBankVerified: () => void;
  onApprove: () => void;
  onReject: () => void;
}

/** The "Driver Dossier & Onboarding" dialog: profile fields plus the embedded DriverKycPanel. */
export function DriverDocsDialog({
  open,
  onOpenChange,
  driver,
  onToggleAadhaarVerified,
  onToggleBankVerified,
  onApprove,
  onReject,
}: DriverDocsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Driver Dossier & Onboarding</DialogTitle>
        </DialogHeader>
        {driver && (
          <div className="space-y-4 py-4 text-sm">
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Full Name:</span>
              <span className="font-medium text-foreground">{driver.user?.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Phone:</span>
              <span className="font-medium text-foreground">{driver.user?.phone}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Email:</span>
              <span className="font-medium text-foreground">{driver.user?.email || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Vehicle Type:</span>
              <span className="font-medium text-foreground uppercase">{driver.vehicleType || "bike"}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Duty Status:</span>
              <span className="font-medium text-foreground">{driver.status}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Onboarding Status:</span>
              <span className="font-medium text-foreground uppercase">{driver.onboardingStatus || "not_started"}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Active Location:</span>
              <span className="font-medium text-foreground">{driver.currentLocation?.coordinates?.join(", ") || "Unknown"}</span>
            </div>

            <DriverKycPanel
              driver={driver}
              onToggleAadhaarVerified={onToggleAadhaarVerified}
              onToggleBankVerified={onToggleBankVerified}
              onApprove={onApprove}
              onReject={onReject}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
