import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AvailabilityPill } from "@/components/shared/AvailabilityPill";
import type { MeatCenter } from "../meatCenterTypes";

interface MeatCenterViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  center: MeatCenter | null;
  isUpdating: boolean;
  onToggleManuallyClosed: () => void;
}

/** The "Meat Center Details" View dialog: contact info + availability. */
export function MeatCenterViewDialog({ isOpen, onOpenChange, center, isUpdating, onToggleManuallyClosed }: MeatCenterViewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Meat Center Details</DialogTitle>
        </DialogHeader>
        {center && (
          <div className="space-y-4 py-4 text-sm">
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Name:</span>
              <span className="font-medium text-foreground">{center.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Phone:</span>
              <span className="font-medium text-foreground">{center.phone}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Address:</span>
              <span className="font-medium text-foreground text-right max-w-[250px] break-words">{center.address}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Rating:</span>
              <span className="font-medium text-foreground">
                {center.rating} ★ ({center.reviews} reviews)
              </span>
            </div>

            <div className="p-3 bg-muted rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <label className="font-bold text-foreground text-xs block">Order Availability</label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">A closed centre drops out of the app's "Open now" filter.</p>
                </div>
                <AvailabilityPill openState={center.openState} isManuallyClosed={center.isManuallyClosed} />
              </div>
              <Button size="sm" variant={center.isManuallyClosed ? "default" : "destructive"} className="w-full rounded-lg" disabled={isUpdating} onClick={onToggleManuallyClosed}>
                {center.isManuallyClosed ? "Reopen Meat Center" : "Close Meat Center Now"}
              </Button>
              {center.openState?.week?.length ? (
                <div className="space-y-0.5 pt-1 border-t border-border/60">
                  {center.openState.week.map((day) => (
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
