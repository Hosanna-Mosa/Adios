import { format } from "date-fns";
import { Clock, Phone, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ScheduledDeliveryRequest } from "../vendorDashboardTypes";

interface VendorScheduledRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  request: ScheduledDeliveryRequest | null;
  onRespond: (accepted: boolean) => void;
  isResponding: boolean;
}

/** The scheduled-delivery request modal: accept or reject a customer's requested delivery time. */
export function VendorScheduledRequestDialog({ isOpen, onOpenChange, request, onRespond, isResponding }: VendorScheduledRequestDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Scheduled delivery request</DialogTitle>
        </DialogHeader>

        {request && (
          <div className="space-y-5 pt-2">
            <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2.5 text-sm">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-semibold text-foreground">{request.customerName || "Customer"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{request.customerPhone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium text-foreground">{format(new Date(request.scheduledFor), "EEE, MMM d · hh:mm a")}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">Accept only if your kitchen can prepare and hand off the order at the requested time.</p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onRespond(false)} disabled={isResponding} className="flex-1 h-11 rounded-2xl font-bold">
                Reject
              </Button>
              <Button onClick={() => onRespond(true)} disabled={isResponding} className="flex-1 h-11 rounded-2xl font-bold bg-primary hover:bg-primary/95">
                {isResponding ? "Saving..." : "Accept"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
