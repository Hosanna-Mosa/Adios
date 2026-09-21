import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AvailabilityPill } from "@/components/shared/AvailabilityPill";
import type { Vendor } from "../types";

interface VendorViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
  commRate: number;
  onCommRateChange: (value: number) => void;
  isUpdating: boolean;
  onToggleManuallyClosed: () => void;
  onSaveCommission: () => void;
  onApprove: () => void;
  onReject: () => void;
}

/** The "Restaurant Details" View dialog: availability, commission, legal info, approve/reject. */
export function VendorViewDialog({
  isOpen,
  onOpenChange,
  vendor,
  commRate,
  onCommRateChange,
  isUpdating,
  onToggleManuallyClosed,
  onSaveCommission,
  onApprove,
  onReject,
}: VendorViewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[485px] rounded-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Restaurant Details</DialogTitle>
        </DialogHeader>
        {vendor && (
          <div className="space-y-4 py-4 text-sm">
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Name:</span>
              <span className="font-medium text-foreground">{vendor.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Email:</span>
              <span className="font-medium text-foreground">{vendor.email || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Phone:</span>
              <span className="font-medium text-foreground">{vendor.phone}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Address:</span>
              <span className="font-medium text-foreground text-right max-w-[250px] break-words">{vendor.address}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Rating:</span>
              <span className="font-medium text-foreground">
                {vendor.rating} ★ ({vendor.reviews} reviews)
              </span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Pure Veg:</span>
              <span className="font-medium text-foreground">{vendor.isPureVeg ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Current Onboarding:</span>
              <span className="font-medium text-foreground uppercase">{vendor.onboardingStatus || "draft"}</span>
            </div>

            <div className="p-3 bg-muted rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <label className="font-bold text-foreground text-xs block">Order Availability</label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">A closed outlet drops out of the app's "Open now" filter.</p>
                </div>
                <AvailabilityPill openState={vendor.openState} isManuallyClosed={vendor.isManuallyClosed} />
              </div>
              <Button size="sm" variant={vendor.isManuallyClosed ? "default" : "destructive"} className="w-full rounded-lg" disabled={isUpdating} onClick={onToggleManuallyClosed}>
                {vendor.isManuallyClosed ? "Reopen Restaurant" : "Close Restaurant Now"}
              </Button>
              {vendor.openState?.week?.length ? (
                <div className="space-y-0.5 pt-1 border-t border-border/60">
                  {vendor.openState.week.map((day) => (
                    <div key={day.day} className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">{day.day}</span>
                      <span className="font-medium text-foreground">{day.hours}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/60">No weekly hours set — open around the clock unless closed above.</p>
              )}
            </div>

            <div className="p-3 bg-muted rounded-xl space-y-2">
              <label className="font-bold text-foreground text-xs block">Platform Commission Rate (%)</label>
              <div className="flex gap-2">
                <Input type="number" value={commRate} onChange={(e) => onCommRateChange(Number(e.target.value))} className="h-9 w-24 bg-card" min="0" max="100" />
                <Button size="sm" onClick={onSaveCommission}>
                  Save Rate
                </Button>
              </div>
            </div>

            <div className="mt-2 border-t border-border pt-4 space-y-2">
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Legal & Merchant Details</h4>
              <div className="grid grid-cols-2 gap-2 text-xs bg-muted/50 p-2.5 rounded-lg border border-border">
                <div>
                  <span className="font-semibold text-muted-foreground block">GSTIN / PAN</span>
                  <span className="font-medium text-foreground">{vendor.legal?.gstin || vendor.legal?.panNumber || "Not Provided"}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block">FSSAI License</span>
                  <span className="font-medium text-foreground">{vendor.legal?.fssaiNumber || "Not Provided"}</span>
                </div>
                <div className="col-span-2 mt-1 pt-1 border-t border-border/50">
                  <span className="font-semibold text-muted-foreground block">Bank Settlement A/C</span>
                  <span className="font-medium text-foreground">{vendor.legal?.bankAccount ? `${vendor.legal.bankAccount} (${vendor.legal.ifsc})` : "Not Provided"}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg" onClick={onApprove}>
                Approve Restaurant
              </Button>
              <Button variant="destructive" className="flex-1 rounded-lg" onClick={onReject}>
                Reject
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
