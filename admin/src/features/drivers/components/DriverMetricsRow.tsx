import { ShoppingBag, CheckCircle2, XCircle, MapPin, Wallet } from "lucide-react";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";

// Kept from the pre-refactor page: defined but never rendered anywhere on
// this page (none of the 5 metric cards below use it). Moved as-is rather
// than deleted, since removing unused pre-existing code would be a
// functional change, not a move.
function IndianRupeeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="M6 13h10a4 4 0 0 0 0-8H6" />
      <path d="M6 13h3l7 8" />
    </svg>
  );
}

interface DriverMetricsRowProps {
  totalOrdersCount: number;
  completedCount: number;
  cancelledCount: number;
  ordersTodayCount: number;
  totalEarningsToday: string;
}

/** The Fleet Directory tab's bottom 5 metric cards. Pure presentation, driven by props. */
export function DriverMetricsRow({
  totalOrdersCount,
  completedCount,
  cancelledCount,
  ordersTodayCount,
  totalEarningsToday,
}: DriverMetricsRowProps) {
  return (
    <StaggerList className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StaggerItem className="bg-card rounded-xl border border-border p-4 flex items-center gap-3.5 shadow-sm">
        <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Orders</p>
          <p className="text-lg font-bold text-foreground mt-0.5">{totalOrdersCount}</p>
          <p className="text-[9px] text-muted-foreground">Today</p>
        </div>
      </StaggerItem>

      <StaggerItem className="bg-card rounded-xl border border-border p-4 flex items-center gap-3.5 shadow-sm">
        <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Completed Orders</p>
          <p className="text-lg font-bold text-foreground mt-0.5">{completedCount}</p>
          <p className="text-[9px] text-muted-foreground">Today</p>
        </div>
      </StaggerItem>

      <StaggerItem className="bg-card rounded-xl border border-border p-4 flex items-center gap-3.5 shadow-sm">
        <div className="h-10 w-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <XCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Cancelled Orders</p>
          <p className="text-lg font-bold text-foreground mt-0.5">{cancelledCount}</p>
          <p className="text-[9px] text-muted-foreground">Today</p>
        </div>
      </StaggerItem>

      <StaggerItem className="bg-card rounded-xl border border-border p-4 flex items-center gap-3.5 shadow-sm">
        <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Distance</p>
          <p className="text-lg font-bold text-foreground mt-0.5">
            {ordersTodayCount > 0 ? `${(ordersTodayCount * 6.5).toFixed(1)} km` : "156 km"}
          </p>
          <p className="text-[9px] text-muted-foreground">Today</p>
        </div>
      </StaggerItem>

      <StaggerItem className="bg-card rounded-xl border border-border p-4 flex items-center gap-3.5 shadow-sm">
        <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Earnings</p>
          <p className="text-lg font-bold text-foreground mt-0.5">{totalEarningsToday}</p>
          <p className="text-[9px] text-muted-foreground">Today</p>
        </div>
      </StaggerItem>
    </StaggerList>
  );
}
