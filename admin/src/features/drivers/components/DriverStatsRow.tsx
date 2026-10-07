import { Truck, Users as UsersIcon, Star, DollarSign, Compass } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";

const FleetHealthCircularProgress = ({ percentage = 0 }: { percentage?: number }) => {
  const radius = 22;
  const stroke = 4;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center h-14 w-14 shrink-0">
      <svg className="transform -rotate-90 h-14 w-14">
        <circle
          className="text-muted/30"
          strokeWidth={stroke}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={28}
          cy={28}
        />
        <circle
          className="text-emerald-500"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={28}
          cy={28}
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-foreground">{percentage}%</span>
    </div>
  );
};

interface DriverStatsRowProps {
  totalRegistered: number;
  onlineDrivers: number;
  totalEarningsToday: string;
  averageRating: string | null;
  ratedDriversCount: number;
  ordersTodayCount: number;
  fleetHealth: number;
}

/** The Fleet Directory tab's top 5 stat cards. Pure presentation, driven by props. */
export function DriverStatsRow({ totalRegistered, onlineDrivers, totalEarningsToday, averageRating, ratedDriversCount, ordersTodayCount, fleetHealth }: DriverStatsRowProps) {
  const { t } = useTranslation();
  return (
    <StaggerList className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Card 1: Total Registered */}
      <StaggerItem className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <UsersIcon className="h-4.5 w-4.5" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("drivers.totalRegistered")}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{totalRegistered}</p>
            <p className="text-[11px] font-semibold text-emerald-500 mt-1">{t("drivers.onDutyNow", { count: onlineDrivers, defaultValue: "{{count}} on duty now" })}</p>
          </div>
        </div>
      </StaggerItem>

      {/* Card 2: On-Duty Drivers */}
      <StaggerItem className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Truck className="h-4.5 w-4.5" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("drivers.onDutyDrivers")}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{onlineDrivers}</p>
            <p className="text-[11px] font-semibold text-emerald-500 mt-1">
              {t("drivers.percentOfTotal", { percent: totalRegistered > 0 ? Math.round((onlineDrivers / totalRegistered) * 100) : 0, defaultValue: "{{percent}}% of total" })}
            </p>
          </div>
        </div>
      </StaggerItem>

      {/* Card 3: Average Rating */}
      <StaggerItem className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
              <Star className="h-4.5 w-4.5 fill-amber-500" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("vendorDashboard.averageRating")}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{averageRating ?? "—"}</p>
            <p className="text-[11px] font-semibold text-amber-500 mt-1">
              {ratedDriversCount > 0
                ? t("drivers.acrossNRatedDrivers", { count: ratedDriversCount, defaultValue: "across {{count}} rated drivers" })
                : t("drivers.noRatingsYet")}
            </p>
          </div>
        </div>
      </StaggerItem>

      {/* Card 4: Today's Earnings */}
      <StaggerItem className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("drivers.todaysEarnings")}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{totalEarningsToday}</p>
            <p className="text-[11px] font-semibold text-muted-foreground mt-1">{t("drivers.nOrdersToday", { count: ordersTodayCount, defaultValue: "{{count}} orders today" })}</p>
          </div>
        </div>
      </StaggerItem>

      {/* Card 5: Fleet Health */}
      <StaggerItem className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Compass className="h-4.5 w-4.5" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("drivers.fleetHealth")}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{fleetHealth}%</p>
            <p className="text-[11px] font-semibold text-emerald-500 mt-1">
              {t("drivers.xOfYOnDuty", { online: onlineDrivers, total: totalRegistered, defaultValue: "{{online}} of {{total}} on duty" })}
            </p>
          </div>
        </div>
        <div className="self-center">
          <FleetHealthCircularProgress percentage={fleetHealth} />
        </div>
      </StaggerItem>
    </StaggerList>
  );
}
