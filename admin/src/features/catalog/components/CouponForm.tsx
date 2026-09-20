import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { NewCouponForm } from "../couponTypes";

interface CouponFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newCoupon: NewCouponForm;
  onChange: (form: NewCouponForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  isCreating: boolean;
}

/** The "New Coupon Details" dialog, including its trigger button. */
export function CouponForm({ isOpen, onOpenChange, newCoupon, onChange, onSubmit, isCreating }: CouponFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">New Coupon Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Promo Code</label>
            <Input className="uppercase font-bold tracking-wide h-10" placeholder="e.g. WELCOME50" value={newCoupon.code} onChange={(e) => onChange({ ...newCoupon, code: e.target.value })} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Type</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={newCoupon.discountType}
                onChange={(e) => onChange({ ...newCoupon, discountType: e.target.value as "PERCENTAGE" | "FLAT" })}
              >
                <option value="PERCENTAGE">PERCENTAGE (%)</option>
                <option value="FLAT">FLAT (INR)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Value</label>
              <Input type="number" className="h-10" value={newCoupon.discountValue} onChange={(e) => onChange({ ...newCoupon, discountValue: Number(e.target.value) })} required />
            </div>
          </div>

          {newCoupon.discountType === "PERCENTAGE" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Max Discount (₹)</label>
              <Input type="number" className="h-10" value={newCoupon.maxDiscount} onChange={(e) => onChange({ ...newCoupon, maxDiscount: Number(e.target.value) })} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Min Order Value (₹)</label>
              <Input type="number" className="h-10" value={newCoupon.minOrderValue} onChange={(e) => onChange({ ...newCoupon, minOrderValue: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Expiry Date</label>
              <Input type="date" className="h-10 text-xs" value={newCoupon.expiryDate} onChange={(e) => onChange({ ...newCoupon, expiryDate: e.target.value })} />
            </div>
          </div>

          <Button type="submit" className="w-full rounded-xl h-10 mt-4" disabled={isCreating}>
            {isCreating ? "Creating..." : "Launch Coupon"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
