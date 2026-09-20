import { Activity, CheckCircle, XCircle } from "lucide-react";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";

interface DriverDetailStatsProps {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

/** The 3-card trip stats row on DriverDetail. */
export function DriverDetailStats({ totalOrders, completedOrders, cancelledOrders }: DriverDetailStatsProps) {
  return (
    <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <Activity className="h-5 w-5 text-blue-500 mx-auto" />
        <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider font-semibold">Total Trips Received</p>
      </StaggerItem>
      <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
        <p className="text-2xl font-bold text-foreground">{completedOrders}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider font-semibold">Completed Trips</p>
      </StaggerItem>
      <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
        <p className="text-2xl font-bold text-foreground">{cancelledOrders}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider font-semibold">Cancelled Trips</p>
      </StaggerItem>
    </StaggerList>
  );
}
