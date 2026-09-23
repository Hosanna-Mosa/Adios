import { format } from "date-fns";
import { Clock, Phone, User } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t("vendorDashboard.scheduledDeliveryRequest")}</DialogTitle>
        </DialogHeader>

        {request && (
          <div className="space-y-5 pt-2">
            <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2.5 text-sm">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-semibold text-foreground">{request.customerName || t("vendorDashboard.customer")}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{request.customerPhone || t("vendorDashboard.notAvailable")}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium text-foreground">{format(new Date(request.scheduledFor), "EEE, MMM d · hh:mm a")}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{t("vendorDashboard.acceptOnlyIfKitchenCanPrepare")}</p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onRespond(false)} disabled={isResponding} className="flex-1 h-11 rounded-2xl font-bold">
                {t("vendorDashboard.reject")}
              </Button>
              <Button onClick={() => onRespond(true)} disabled={isResponding} className="flex-1 h-11 rounded-2xl font-bold bg-primary hover:bg-primary/95">
                {isResponding ? t("vendorDashboard.saving") : t("vendorDashboard.accept")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
