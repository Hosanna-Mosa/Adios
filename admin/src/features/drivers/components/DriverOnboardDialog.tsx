import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t("drivers.onboardNewDriver")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("drivers.driverFullName")}</label>
            <Input
              value={newDriver.name}
              onChange={(e) => onChange({ ...newDriver, name: e.target.value })}
              placeholder={t("drivers.egDavidMiller")}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("vendorAuth.emailAddress")}</label>
            <Input
              type="email"
              value={newDriver.email}
              onChange={(e) => onChange({ ...newDriver, email: e.target.value })}
              placeholder="david@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("users.phoneNumber")}</label>
            <Input
              value={newDriver.phone}
              onChange={(e) => onChange({ ...newDriver, phone: e.target.value })}
              placeholder="e.g. 9876543211"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("vendorAuth.password")}</label>
            <Input
              type="password"
              value={newDriver.password}
              onChange={(e) => onChange({ ...newDriver, password: e.target.value })}
              placeholder={t("drivers.setDriverPortalPassword")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("drivers.vehicleCategory")}</label>
            <select
              value={newDriver.vehicleType}
              onChange={(e) => onChange({ ...newDriver, vehicleType: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="bike">{t("drivers.vehicleBike")}</option>
              <option value="auto">{t("drivers.vehicleAuto")}</option>
              <option value="car">{t("drivers.vehicleCar")}</option>
            </select>
          </div>
          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? t("drivers.onboardingEllipsis") : t("drivers.onboardDriver")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
