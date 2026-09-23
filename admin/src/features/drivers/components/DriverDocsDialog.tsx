import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t("drivers.driverDossierAndOnboarding")}</DialogTitle>
        </DialogHeader>
        {driver && (
          <div className="space-y-4 py-4 text-sm">
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("users.fullNameColon")}</span>
              <span className="font-medium text-foreground">{driver.user?.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("users.phoneColon")}</span>
              <span className="font-medium text-foreground">{driver.user?.phone}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("vendorAuth.emailAddress")}:</span>
              <span className="font-medium text-foreground">{driver.user?.email || t("vendorDashboard.notAvailable")}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("drivers.vehicleTypeColon")}</span>
              <span className="font-medium text-foreground uppercase">{driver.vehicleType || "bike"}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("drivers.dutyStatusColon")}</span>
              <span className="font-medium text-foreground">{driver.status}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("drivers.onboardingStatusColon")}</span>
              <span className="font-medium text-foreground uppercase">{driver.onboardingStatus || "not_started"}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("drivers.activeLocationColon")}</span>
              <span className="font-medium text-foreground">{driver.currentLocation?.coordinates?.join(", ") || t("drivers.unknown")}</span>
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
