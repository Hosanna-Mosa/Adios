import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ManualOrderForm } from "../liveOrdersTypes";

interface ManualDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manualOrder: ManualOrderForm;
  setManualOrder: (order: ManualOrderForm) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/** The "Manual Order Dispatch" modal on LiveOrders.tsx. */
export function ManualDispatchDialog({ open, onOpenChange, manualOrder, setManualOrder, onSubmit }: ManualDispatchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Manual Order Dispatch</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer Name</label>
            <Input
              value={manualOrder.customer}
              onChange={e => setManualOrder({...manualOrder, customer: e.target.value})}
              placeholder="e.g. Alice Smith"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Pickup Location (Store / Restaurant)</label>
            <Input
              value={manualOrder.pickup}
              onChange={e => setManualOrder({...manualOrder, pickup: e.target.value})}
              placeholder="e.g. McDonald's - Downtown"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Dropoff Destination</label>
            <Input
              value={manualOrder.dropoff}
              onChange={e => setManualOrder({...manualOrder, dropoff: e.target.value})}
              placeholder="e.g. 456 Elm St, Suite 4"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Estimated Delivery Fare (₹)</label>
            <Input
              value={manualOrder.deliveryFee}
              onChange={e => setManualOrder({...manualOrder, deliveryFee: e.target.value})}
              placeholder="150"
            />
          </div>
          <Button type="submit" className="w-full mt-4 bg-primary text-primary-foreground">
            Dispatch Order
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
