import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { AdminDriver } from "../types";

interface DriverKycPanelProps {
  driver: AdminDriver;
  onToggleAadhaarVerified: () => void;
  onToggleBankVerified: () => void;
  onApprove: () => void;
  onReject: () => void;
}

/**
 * Documents & Verification block from the driver dossier: Aadhaar/Bank/DL
 * status plus Approve/Reject actions. Callback-driven (no mutation/API
 * knowledge of its own) so it can be reused by DriverDetail.tsx (work
 * queue item #6) as well as Drivers.tsx's dossier dialog.
 */
export function DriverKycPanel({ driver, onToggleAadhaarVerified, onToggleBankVerified, onApprove, onReject }: DriverKycPanelProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-4 pt-4 border-t border-border space-y-3">
      <h4 className="font-bold text-foreground text-base">{t("drivers.documentsAndVerification")}</h4>

      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-xl border border-border">
        <div>
          <p className="font-semibold text-xs">{t("drivers.aadhaarVerification")}</p>
          <p className="text-[11px] text-muted-foreground">{driver.aadhaarNumber || t("drivers.noAadhaarProvided")}</p>
        </div>
        <Button size="sm" variant={driver.aadhaarVerified ? "outline" : "default"} onClick={onToggleAadhaarVerified}>
          {driver.aadhaarVerified ? t("drivers.verified") : t("drivers.verify")}
        </Button>
      </div>

      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-xl border border-border">
        <div>
          <p className="font-semibold text-xs">{t("drivers.bankDetailsVerification")}</p>
          <p className="text-[11px] text-muted-foreground">
            {driver.bankAccountNumber ? t("drivers.acColonDetails", { account: driver.bankAccountNumber, ifsc: driver.bankIfsc, defaultValue: "A/C: {{account}} ({{ifsc}})" }) : t("drivers.noBankDetailsProvided")}
          </p>
        </div>
        <Button size="sm" variant={driver.bankVerified ? "outline" : "default"} onClick={onToggleBankVerified}>
          {driver.bankVerified ? t("drivers.verified") : t("drivers.verify")}
        </Button>
      </div>

      {driver.dlNumber && (
        <div className="p-3 bg-muted/50 rounded-xl border border-border space-y-1">
          <p className="font-semibold text-xs">{t("drivers.drivingLicense")}</p>
          <p className="text-[11px] text-muted-foreground">{t("drivers.dlNoColon", { number: driver.dlNumber, defaultValue: "DL No: {{number}}" })}</p>
          {driver.dlExpiry && (
            <p className="text-[10px] text-muted-foreground font-medium">{t("drivers.expiresColon", { date: new Date(driver.dlExpiry).toLocaleDateString(), defaultValue: "Expires: {{date}}" })}</p>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl" onClick={onApprove}>
          {t("drivers.approveDriver")}
        </Button>
        <Button variant="destructive" className="flex-1 rounded-xl" onClick={onReject}>
          {t("drivers.rejectDriver")}
        </Button>
      </div>
    </div>
  );
}
