import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Navigation, Settings, User } from "lucide-react";
import { StaggerItem } from "@/components/motion/StaggerItem";
import type { DevDriver } from "../devDriversTypes";

interface DevDriverCardProps {
  driver: DevDriver;
  updatingId: string | null;
  onStatusToggle: (driver: DevDriver) => void;
  onVehicleChange: (driver: DevDriver, vehicleType: "bike" | "auto" | "car") => void;
  onLocationSubmit: (driver: DevDriver, latStr: string, lngStr: string) => void;
}

/** One dev-driver's status/vehicle/coordinates card on DevDrivers.tsx. */
export function DevDriverCard({ driver, updatingId, onStatusToggle, onVehicleChange, onLocationSubmit }: DevDriverCardProps) {
  const [lng, lat] = driver.currentLocation?.coordinates || [82.2475, 16.9891];

  return (
    <StaggerItem className="section-card p-6 flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">{driver.user?.name}</h4>
            <p className="text-xs text-muted-foreground">{driver.user?.phone}</p>
          </div>
        </div>
        <span
          onClick={() => onStatusToggle(driver)}
          className={`cursor-pointer px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
            driver.status === "ONLINE"
              ? "bg-green-500/10 text-green-500 border border-green-500/20"
              : "bg-red-500/10 text-red-500 border border-red-500/20"
          }`}
        >
          {driver.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Settings className="h-4 w-4" /> Vehicle Type
          </span>
          <div className="flex gap-1.5">
            {(["bike", "auto", "car"] as const).map((type) => (
              <button
                key={type}
                onClick={() => onVehicleChange(driver, type)}
                className={`px-2 py-1 rounded text-xs capitalize border transition-all ${
                  driver.vehicleType === type
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t border-border/50 pt-3">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5" /> Set Location Coordinates
          </span>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              onLocationSubmit(
                driver,
                formData.get("lat") as string,
                formData.get("lng") as string
              );
            }}
            className="grid grid-cols-2 gap-2"
          >
            <div>
              <label className="text-[10px] text-muted-foreground">Latitude</label>
              <Input
                name="lat"
                defaultValue={lat.toFixed(6)}
                className="h-8 text-xs"
                placeholder="Lat"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Longitude</label>
              <Input
                name="lng"
                defaultValue={lng.toFixed(6)}
                className="h-8 text-xs"
                placeholder="Lng"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={updatingId === driver._id}
              className="col-span-2 h-8 text-xs mt-1"
            >
              {updatingId === driver._id ? (
                <RefreshCw className="h-3 w-3 animate-spin mr-1.5" />
              ) : null}
              Update Coordinates
            </Button>
          </form>
        </div>
      </div>
    </StaggerItem>
  );
}
