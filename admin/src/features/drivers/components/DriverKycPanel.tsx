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
  return (
    <div className="mt-4 pt-4 border-t border-border space-y-3">
      <h4 className="font-bold text-foreground text-base">Documents & Verification</h4>

      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-xl border border-border">
        <div>
          <p className="font-semibold text-xs">Aadhaar Verification</p>
          <p className="text-[11px] text-muted-foreground">{driver.aadhaarNumber || "No Aadhaar provided"}</p>
        </div>
        <Button size="sm" variant={driver.aadhaarVerified ? "outline" : "default"} onClick={onToggleAadhaarVerified}>
          {driver.aadhaarVerified ? "Verified" : "Verify"}
        </Button>
      </div>

      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-xl border border-border">
        <div>
          <p className="font-semibold text-xs">Bank Details Verification</p>
          <p className="text-[11px] text-muted-foreground">
            {driver.bankAccountNumber ? `A/C: ${driver.bankAccountNumber} (${driver.bankIfsc})` : "No bank details provided"}
          </p>
        </div>
        <Button size="sm" variant={driver.bankVerified ? "outline" : "default"} onClick={onToggleBankVerified}>
          {driver.bankVerified ? "Verified" : "Verify"}
        </Button>
      </div>

      {driver.dlNumber && (
        <div className="p-3 bg-muted/50 rounded-xl border border-border space-y-1">
          <p className="font-semibold text-xs">Driving License</p>
          <p className="text-[11px] text-muted-foreground">DL No: {driver.dlNumber}</p>
          {driver.dlExpiry && (
            <p className="text-[10px] text-muted-foreground font-medium">Expires: {new Date(driver.dlExpiry).toLocaleDateString()}</p>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl" onClick={onApprove}>
          Approve Driver
        </Button>
        <Button variant="destructive" className="flex-1 rounded-xl" onClick={onReject}>
          Reject Driver
        </Button>
      </div>
    </div>
  );
}
