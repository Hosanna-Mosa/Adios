import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { NewDriverForm } from "../types";

interface DriverOnboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newDriver: NewDriverForm;
  onChange: (driver: NewDriverForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

/** The "Onboard New Driver" form dialog. */
export function DriverOnboardDialog({ open, onOpenChange, newDriver, onChange, onSubmit, isSubmitting }: DriverOnboardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Onboard New Driver</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Driver Full Name</label>
            <Input
              value={newDriver.name}
              onChange={(e) => onChange({ ...newDriver, name: e.target.value })}
              placeholder="e.g. David Miller"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              type="email"
              value={newDriver.email}
              onChange={(e) => onChange({ ...newDriver, email: e.target.value })}
              placeholder="david@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              value={newDriver.phone}
              onChange={(e) => onChange({ ...newDriver, phone: e.target.value })}
              placeholder="e.g. 9876543211"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={newDriver.password}
              onChange={(e) => onChange({ ...newDriver, password: e.target.value })}
              placeholder="Set driver portal password"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Vehicle Category</label>
            <select
              value={newDriver.vehicleType}
              onChange={(e) => onChange({ ...newDriver, vehicleType: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="bike">Motorcycle / Bicycle (bike)</option>
              <option value="auto">Three-Wheeler Auto (auto)</option>
              <option value="car">Delivery Van / Car (car)</option>
            </select>
          </div>
          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? "Onboarding..." : "Onboard Driver"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
