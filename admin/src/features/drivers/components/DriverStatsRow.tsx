import { Truck, Users as UsersIcon, Star, DollarSign, Compass } from "lucide-react";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";

// Sparkline SVGs for Stat Cards
const GreenSparkline = () => (
  <svg className="h-8 w-24 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
    <defs>
      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M0,22 Q15,8 30,18 T60,5 T90,12 L100,8" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
    <path d="M0,22 Q15,8 30,18 T60,5 T90,12 L100,8 L100,30 L0,30 Z" fill="url(#greenGrad)" />
  </svg>
);

const OrangeSparkline = () => (
  <svg className="h-8 w-24 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
    <defs>
      <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M0,25 Q15,15 30,22 T60,10 T90,18 L100,12" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
    <path d="M0,25 Q15,15 30,22 T60,10 T90,18 L100,12 L100,30 L0,30 Z" fill="url(#orangeGrad)" />
  </svg>
);

const BlueSparkline = () => (
  <svg className="h-8 w-24 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
    <defs>
      <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M0,20 Q15,18 30,25 T60,12 T90,20 L100,15" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
    <path d="M0,20 Q15,18 30,25 T60,12 T90,20 L100,15 L100,30 L0,30 Z" fill="url(#blueGrad)" />
  </svg>
);

// Kept from the pre-refactor page: defined but never rendered by any card
// below (there were only 4 sparkline colors used for 5 cards -- the 5th,
// Fleet Health, uses FleetHealthCircularProgress instead). Moved as-is
// rather than deleted, since removing unused pre-existing code would be a
// functional change, not a move.
const PurpleSparkline = () => (
  <svg className="h-8 w-24 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
    <defs>
      <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M0,15 Q15,22 30,12 T60,25 T90,15 L100,20" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
    <path d="M0,15 Q15,22 30,12 T60,25 T90,15 L100,20 L100,30 L0,30 Z" fill="url(#purpleGrad)" />
  </svg>
);

const FleetHealthCircularProgress = ({ percentage = 98 }: { percentage?: number }) => {
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
}

/** The Fleet Directory tab's top 5 stat cards. Pure presentation, driven by props. */
export function DriverStatsRow({ totalRegistered, onlineDrivers, totalEarningsToday }: DriverStatsRowProps) {
  return (
    <StaggerList className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Card 1: Total Registered */}
      <StaggerItem className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <UsersIcon className="h-4.5 w-4.5" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Registered</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{totalRegistered}</p>
            <p className="text-[11px] font-semibold text-emerald-500 mt-1">+2 this week</p>
          </div>
        </div>
        <div className="self-end pb-1">
          <GreenSparkline />
        </div>
      </StaggerItem>

      {/* Card 2: On-Duty Drivers */}
      <StaggerItem className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Truck className="h-4.5 w-4.5" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">On-Duty Drivers</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{onlineDrivers}</p>
            <p className="text-[11px] font-semibold text-emerald-500 mt-1">
              {totalRegistered > 0 ? Math.round((onlineDrivers / totalRegistered) * 100) : 0}% of total
            </p>
          </div>
        </div>
        <div className="self-end pb-1">
          <GreenSparkline />
        </div>
      </StaggerItem>

      {/* Card 3: Average Rating */}
      <StaggerItem className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
              <Star className="h-4.5 w-4.5 fill-amber-500" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Average Rating</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">4.8</p>
            <p className="text-[11px] font-semibold text-amber-500 mt-1">+0.2 this week</p>
          </div>
        </div>
        <div className="self-end pb-1">
          <OrangeSparkline />
        </div>
      </StaggerItem>

      {/* Card 4: Today's Earnings */}
      <StaggerItem className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Today's Earnings</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{totalEarningsToday}</p>
            <p className="text-[11px] font-semibold text-muted-foreground mt-1">Target: ₹0</p>
          </div>
        </div>
        <div className="self-end pb-1">
          <BlueSparkline />
        </div>
      </StaggerItem>

      {/* Card 5: Fleet Health */}
      <StaggerItem className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Compass className="h-4.5 w-4.5" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Fleet Health</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">98%</p>
            <p className="text-[11px] font-semibold text-emerald-500 mt-1">Healthy</p>
          </div>
        </div>
        <div className="self-center">
          <FleetHealthCircularProgress percentage={98} />
        </div>
      </StaggerItem>
    </StaggerList>
  );
}
