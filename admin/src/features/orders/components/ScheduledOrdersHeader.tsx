import { SlidersHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ScheduleStatus } from "../scheduledOrdersTypes";

interface ScheduledOrdersHeaderProps {
  statusFilter: "ALL" | ScheduleStatus;
  onFilterChange: (value: "ALL" | ScheduleStatus) => void;
}

/** The title + status filter dropdown on ScheduledOrders.tsx. */
export function ScheduledOrdersHeader({ statusFilter, onFilterChange }: ScheduledOrdersHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="page-header">Scheduled Orders</h1>
        <p className="page-subtitle">Approve or decline the delivery slots customers booked ahead of time.</p>
      </div>
      <div className="flex gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
              <SlidersHorizontal className="h-4 w-4" /> Filter: {statusFilter}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onFilterChange("ALL")} className="cursor-pointer">All Requests</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("pending")} className="cursor-pointer">Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("accepted")} className="cursor-pointer">Accepted</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("rejected")} className="cursor-pointer">Rejected</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
