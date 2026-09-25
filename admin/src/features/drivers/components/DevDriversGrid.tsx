import { RefreshCw, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StaggerList } from "@/components/motion/StaggerList";
import { DevDriverCard } from "./DevDriverCard";
import type { DevDriver } from "../devDriversTypes";

interface DevDriversGridProps {
  isLoading: boolean;
  drivers: DevDriver[];
  updatingId: string | null;
  onStatusToggle: (driver: DevDriver) => void;
  onVehicleChange: (driver: DevDriver, vehicleType: "bike" | "auto" | "car") => void;
  onLocationSubmit: (driver: DevDriver, latStr: string, lngStr: string) => void;
}

/** The loading/empty/grid states for the dev-driver cards on DevDrivers.tsx. */
export function DevDriversGrid({ isLoading, drivers, updatingId, onStatusToggle, onVehicleChange, onLocationSubmit }: DevDriversGridProps) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" /> {t("drivers.loadingDevDrivers")}
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="section-card p-12 text-center flex flex-col items-center justify-center gap-4">
        <ShieldAlert className="h-12 w-12 text-warning" />
        <h4 className="font-bold text-foreground">{t("drivers.noDevDriversSeeded")}</h4>
        <p className="text-sm text-muted-foreground max-w-md">
          {t("drivers.pleaseClickButtonToSeedDesc")}
        </p>
      </div>
    );
  }

  return (
    <StaggerList className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {drivers.map((driver) => (
        <DevDriverCard
          key={driver._id}
          driver={driver}
          updatingId={updatingId}
          onStatusToggle={onStatusToggle}
          onVehicleChange={onVehicleChange}
          onLocationSubmit={onLocationSubmit}
        />
      ))}
    </StaggerList>
  );
}
