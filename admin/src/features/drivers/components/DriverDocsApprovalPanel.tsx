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
  return (
    <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm">
      <h3 className="text-lg font-bold text-foreground">Documents & Approvals</h3>
      <p className="text-xs text-muted-foreground">Verify driver identities and toggle onboarding status to control route assignments.</p>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between p-3 bg-muted rounded-xl border border-border">
          <div>
            <span className="font-semibold text-xs text-foreground block">Aadhaar Document</span>
            <span className="text-[10px] text-muted-foreground">{driver.aadhaarNumber || "Not Provided"}</span>
          </div>
          <Button size="sm" variant={driver.aadhaarVerified ? "outline" : "default"} onClick={onToggleAadhaarVerified}>
            {driver.aadhaarVerified ? "Verified" : "Verify"}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-xl border border-border">
          <div>
            <span className="font-semibold text-xs text-foreground block">Bank Settlement Accounts</span>
            <span className="text-[10px] text-muted-foreground">{driver.bankAccountNumber ? `${driver.bankAccountNumber} (${driver.bankIfsc})` : "Not Provided"}</span>
          </div>
          <Button size="sm" variant={driver.bankVerified ? "outline" : "default"} onClick={onToggleBankVerified}>
            {driver.bankVerified ? "Verified" : "Verify"}
          </Button>
        </div>

        {driver.dlNumber && (
          <div className="p-3 bg-muted rounded-xl border border-border space-y-1 text-xs">
            <span className="font-semibold text-foreground block">Driving License (DL)</span>
            <span className="text-muted-foreground block">DL Number: {driver.dlNumber}</span>
            {driver.dlExpiry && <span className="text-muted-foreground block">DL Expiry: {new Date(driver.dlExpiry).toLocaleDateString()}</span>}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg" onClick={onApprove}>
          Approve Driver
        </Button>
        <Button variant="destructive" className="flex-1 rounded-lg" onClick={onReject}>
          Reject Driver
        </Button>
      </div>
    </div>
  );
}
