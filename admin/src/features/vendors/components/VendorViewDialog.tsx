import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AvailabilityPill } from "@/components/shared/AvailabilityPill";
import type { Vendor } from "../types";

const STATUS_LABEL_KEY: Record<string, string> = {
  approved: "catalog.approved",
  rejected: "catalog.rejected",
  submitted: "catalog.submitted",
  resubmission_required: "catalog.resubmissionRequired",
  draft: "catalog.draft",
};

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
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[485px] rounded-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t("catalog.restaurantDetails")}</DialogTitle>
        </DialogHeader>
        {vendor && (
          <div className="space-y-4 py-4 text-sm">
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("catalog.nameColon")}</span>
              <span className="font-medium text-foreground">{vendor.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("catalog.emailColon")}</span>
              <span className="font-medium text-foreground">{vendor.email || t("orders.notAvailableShort")}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("catalog.phoneColon")}</span>
              <span className="font-medium text-foreground">{vendor.phone}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("catalog.addressColon")}</span>
              <span className="font-medium text-foreground text-right max-w-[250px] break-words">{vendor.address}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("catalog.ratingColon")}</span>
              <span className="font-medium text-foreground">
                {t("catalog.ratingWithReviews", { rating: vendor.rating, count: vendor.reviews, defaultValue: "{{rating}} ★ ({{count}} reviews)" })}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("catalog.pureVegColon")}</span>
              <span className="font-medium text-foreground">{vendor.isPureVeg ? t("catalog.yes") : t("catalog.no")}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("catalog.currentOnboardingColon")}</span>
              <span className="font-medium text-foreground uppercase">{t(STATUS_LABEL_KEY[vendor.onboardingStatus || "draft"] || STATUS_LABEL_KEY.draft)}</span>
            </div>

            <div className="p-3 bg-muted rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <label className="font-bold text-foreground text-xs block">{t("catalog.orderAvailability")}</label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{t("catalog.closedOutletDropsOutDesc")}</p>
                </div>
                <AvailabilityPill openState={vendor.openState} isManuallyClosed={vendor.isManuallyClosed} />
              </div>
              <Button size="sm" variant={vendor.isManuallyClosed ? "default" : "destructive"} className="w-full rounded-lg" disabled={isUpdating} onClick={onToggleManuallyClosed}>
                {vendor.isManuallyClosed ? t("catalog.reopenRestaurant") : t("catalog.closeRestaurantNow")}
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
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/60">{t("catalog.noWeeklyHoursSetDesc")}</p>
              )}
            </div>

            <div className="p-3 bg-muted rounded-xl space-y-2">
              <label className="font-bold text-foreground text-xs block">{t("catalog.platformCommissionRate")}</label>
              <div className="flex gap-2">
                <Input type="number" value={commRate} onChange={(e) => onCommRateChange(Number(e.target.value))} className="h-9 w-24 bg-card" min="0" max="100" />
                <Button size="sm" onClick={onSaveCommission}>
                  {t("catalog.saveRate")}
                </Button>
              </div>
            </div>

            <div className="mt-2 border-t border-border pt-4 space-y-2">
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">{t("catalog.legalAndMerchantDetails")}</h4>
              <div className="grid grid-cols-2 gap-2 text-xs bg-muted/50 p-2.5 rounded-lg border border-border">
                <div>
                  <span className="font-semibold text-muted-foreground block">{t("catalog.gstinPan")}</span>
                  <span className="font-medium text-foreground">{vendor.legal?.gstin || vendor.legal?.panNumber || t("catalog.notProvided")}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block">{t("catalog.fssaiLicense")}</span>
                  <span className="font-medium text-foreground">{vendor.legal?.fssaiNumber || t("catalog.notProvided")}</span>
                </div>
                <div className="col-span-2 mt-1 pt-1 border-t border-border/50">
                  <span className="font-semibold text-muted-foreground block">{t("catalog.bankSettlementAc")}</span>
                  <span className="font-medium text-foreground">{vendor.legal?.bankAccount ? `${vendor.legal.bankAccount} (${vendor.legal.ifsc})` : t("catalog.notProvided")}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg" onClick={onApprove}>
                {t("catalog.approveRestaurant")}
              </Button>
              <Button variant="destructive" className="flex-1 rounded-lg" onClick={onReject}>
                {t("orders.reject")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
