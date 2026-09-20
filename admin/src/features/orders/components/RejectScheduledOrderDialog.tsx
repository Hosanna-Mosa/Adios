import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { orderLabel, formatSlot, type ScheduledOrder } from "../scheduledOrdersTypes";

interface RejectScheduledOrderDialogProps {
  rejectingOrder: ScheduledOrder | null;
  onOpenChange: (open: boolean) => void;
  rejectReason: string;
  setRejectReason: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

/** The "Reject Scheduled Order" modal on ScheduledOrders.tsx — the reason is optional and rides along to the customer's notification. */
export function RejectScheduledOrderDialog({ rejectingOrder, onOpenChange, rejectReason, setRejectReason, onSubmit, isSubmitting }: RejectScheduledOrderDialogProps) {
  return (
    <Dialog open={!!rejectingOrder} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Reject Scheduled Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          {rejectingOrder && (
            <div className="rounded-2xl bg-muted/50 p-4 space-y-1 text-sm">
              <p className="font-semibold text-foreground">{orderLabel(rejectingOrder._id)}</p>
              <p className="text-muted-foreground">
                {rejectingOrder.user?.name || "Customer"} · {rejectingOrder.vendor?.name || "Restaurant"}
              </p>
              <p className="text-muted-foreground">{formatSlot(rejectingOrder.scheduledFor)}</p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason (optional)</label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. The kitchen is fully booked for that slot"
            />
            <p className="text-xs text-muted-foreground">
              The customer is notified of the rejection either way; a reason is shown with it.
            </p>
          </div>
          <Button type="submit" variant="destructive" className="w-full h-11 rounded-xl" disabled={isSubmitting}>
            {isSubmitting ? "Rejecting..." : "Reject Order"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
