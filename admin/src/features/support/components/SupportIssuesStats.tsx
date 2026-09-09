import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";

interface SupportIssuesStatsProps {
  activeCount: number;
  pendingCount: number;
  resolvedCount: number;
}

/** The 3-card dashboard stats row on SupportIssues. */
export function SupportIssuesStats({ activeCount, pendingCount, resolvedCount }: SupportIssuesStatsProps) {
  return (
    <StaggerList className="grid grid-cols-3 gap-6">
      <StaggerItem className="section-card p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Active Tickets</p>
          <h3 className="text-2xl font-bold text-foreground">{activeCount}</h3>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
      </StaggerItem>
      <StaggerItem className="section-card p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Resolution</p>
          <h3 className="text-2xl font-bold text-warning">{pendingCount}</h3>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-warning/10 flex items-center justify-center">
          <Clock className="h-6 w-6 text-warning" />
        </div>
      </StaggerItem>
      <StaggerItem className="section-card p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resolved Tickets</p>
          <h3 className="text-2xl font-bold text-[#00665c]">{resolvedCount}</h3>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-[#e6f4f2] flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-[#00665c]" />
        </div>
      </StaggerItem>
    </StaggerList>
  );
}
