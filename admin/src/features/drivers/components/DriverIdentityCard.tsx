import { Truck, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DetailIdentityCard } from "@/components/shared/DetailIdentityCard";
import type { DriverProfile } from "../driverDetailTypes";

interface DriverIdentityCardProps {
  driver: DriverProfile;
  onAssignZoneClick: () => void;
}

/**
 * The driver identity/status header card: avatar, name, status badges, zone
 * assignment. Built on the shared DetailIdentityCard shell (added when
 * UserDetail, item #11, needed the same wrapper) -- the badges and the
 * right-side zone/vehicle block stay driver-specific here.
 */
export function DriverIdentityCard({ driver, onAssignZoneClick }: DriverIdentityCardProps) {
  const { t } = useTranslation();
  return (
    <DetailIdentityCard
      icon={<Truck className="h-8 w-8" />}
      title={driver.user?.name ?? ""}
      badges={
        <>
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
            {t("drivers.onboardingColon")} {driver.onboardingStatus || "not_started"}
          </span>
        </>
      }
      subtitle={
        <>
          {t("drivers.phoneColonValue", { phone: driver.user?.phone, defaultValue: "Phone: {{phone}}" })} • {t("drivers.emailColonValue", { email: driver.user?.email || t("vendorDashboard.notAvailable"), defaultValue: "Email: {{email}}" })}
        </>
      }
      rightContent={
        <div className="flex flex-col gap-1 items-end text-right">
          <div className="flex items-center gap-1.5 justify-end text-sm text-foreground font-semibold text-right">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{t("drivers.zonesColon")} {driver.preferredZones && driver.preferredZones.length > 0 ? driver.preferredZones.map((z) => z.name).join(" & ") : driver.preferredZone?.name || t("drivers.noAssignedZones")}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2.5 rounded-lg border-primary/20 hover:border-primary/50 text-primary font-semibold flex items-center gap-1 mt-1"
            onClick={onAssignZoneClick}
          >
            {t("drivers.assignZone")}
          </Button>
          <span className="text-[10px] text-muted-foreground mt-0.5">{t("drivers.vehicleColon")} {driver.vehicleType || "bike"}</span>
        </div>
      }
    />
  );
}
