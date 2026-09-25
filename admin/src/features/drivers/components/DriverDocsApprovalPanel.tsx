import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { DriverProfile } from "../driverDetailTypes";

interface DriverDocsApprovalPanelProps {
  driver: DriverProfile;
  onToggleAadhaarVerified: () => void;
  onToggleBankVerified: () => void;
  onApprove: () => void;
  onReject: () => void;
}

/**
 * The "Documents & Approvals" card on DriverDetail. The plan's work-queue
 * item #6 says to reuse DriverKycPanel (item #1's dossier-dialog
 * component), but this card's wording, colors, and spacing all differ from
 * it in every field -- "Aadhaar Document" vs "Aadhaar Verification",
 * "Not Provided" vs "No Aadhaar provided", p-3 bg-muted vs p-2 bg-muted/50,
 * emerald-600/rounded-xl vs green-600/rounded-lg approve button, and so
 * on. Reusing DriverKycPanel here would be a real, visible UI change, so
 * this stays its own component instead.
 */
export function DriverDocsApprovalPanel({ driver, onToggleAadhaarVerified, onToggleBankVerified, onApprove, onReject }: DriverDocsApprovalPanelProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm">
      <h3 className="text-lg font-bold text-foreground">{t("drivers.documentsAndApprovals")}</h3>
      <p className="text-xs text-muted-foreground">{t("drivers.verifyDriverIdentitiesDesc")}</p>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between p-3 bg-muted rounded-xl border border-border">
          <div>
            <span className="font-semibold text-xs text-foreground block">{t("drivers.aadhaarDocument")}</span>
            <span className="text-[10px] text-muted-foreground">{driver.aadhaarNumber || t("drivers.notProvided")}</span>
          </div>
          <Button size="sm" variant={driver.aadhaarVerified ? "outline" : "default"} onClick={onToggleAadhaarVerified}>
            {driver.aadhaarVerified ? t("drivers.verified") : t("drivers.verify")}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-xl border border-border">
          <div>
            <span className="font-semibold text-xs text-foreground block">{t("drivers.bankSettlementAccounts")}</span>
            <span className="text-[10px] text-muted-foreground">{driver.bankAccountNumber ? `${driver.bankAccountNumber} (${driver.bankIfsc})` : t("drivers.notProvided")}</span>
          </div>
          <Button size="sm" variant={driver.bankVerified ? "outline" : "default"} onClick={onToggleBankVerified}>
            {driver.bankVerified ? t("drivers.verified") : t("drivers.verify")}
          </Button>
        </div>

        {driver.dlNumber && (
          <div className="p-3 bg-muted rounded-xl border border-border space-y-1 text-xs">
            <span className="font-semibold text-foreground block">{t("drivers.drivingLicenseDl")}</span>
            <span className="text-muted-foreground block">{t("drivers.dlNumberColon", { number: driver.dlNumber, defaultValue: "DL Number: {{number}}" })}</span>
            {driver.dlExpiry && <span className="text-muted-foreground block">{t("drivers.dlExpiryColon", { date: new Date(driver.dlExpiry).toLocaleDateString(), defaultValue: "DL Expiry: {{date}}" })}</span>}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg" onClick={onApprove}>
          {t("drivers.approveDriver")}
        </Button>
        <Button variant="destructive" className="flex-1 rounded-lg" onClick={onReject}>
          {t("drivers.rejectDriver")}
        </Button>
      </div>
    </div>
  );
}
