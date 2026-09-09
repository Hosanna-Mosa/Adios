import { Truck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DriverProfile } from "../driverDetailTypes";

interface DriverIdentityCardProps {
  driver: DriverProfile;
  onAssignZoneClick: () => void;
}

/** The driver identity/status header card: avatar, name, status badges, zone assignment. */
export function DriverIdentityCard({ driver, onAssignZoneClick }: DriverIdentityCardProps) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Truck className="h-8 w-8" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{driver.user?.name}</h1>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                driver.status === "ONLINE" ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {driver.status}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                driver.onboardingStatus === "completed" ? "bg-green-100 text-green-800" : driver.onboardingStatus === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
              }`}
            >
              Onboarding: {driver.onboardingStatus || "not_started"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Phone: {driver.user?.phone} • Email: {driver.user?.email || "N/A"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1 items-end text-right">
        <div className="flex items-center gap-1.5 justify-end text-sm text-foreground font-semibold text-right">
          <MapPin className="h-4 w-4 text-primary" />
          <span>Zones: {driver.preferredZones && driver.preferredZones.length > 0 ? driver.preferredZones.map((z) => z.name).join(" & ") : driver.preferredZone?.name || "No Assigned Zones"}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs px-2.5 rounded-lg border-primary/20 hover:border-primary/50 text-primary font-semibold flex items-center gap-1 mt-1"
          onClick={onAssignZoneClick}
        >
          Assign Zone
        </Button>
        <span className="text-[10px] text-muted-foreground mt-0.5">Vehicle: {driver.vehicleType || "bike"}</span>
      </div>
    </div>
  );
}
