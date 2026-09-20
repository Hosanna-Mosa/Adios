import { SlidersHorizontal, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LiveOrdersHeaderProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  onManualOrderClick: () => void;
}

/** The title + status filter + "Manual Order" button on LiveOrders.tsx. */
export function LiveOrdersHeader({ statusFilter, setStatusFilter, onManualOrderClick }: LiveOrdersHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="page-header">Live Orders</h1>
        <p className="page-subtitle">Real-time monitoring of all active shipments across the network.</p>
      </div>
      <div className="flex gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
              <SlidersHorizontal className="h-4 w-4" /> Filter: {statusFilter}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter("ALL")} className="cursor-pointer">All Statuses</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("SEARCHING_DRIVER")} className="cursor-pointer">Searching Driver</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("DRIVER_ASSIGNED")} className="cursor-pointer">Driver Assigned</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("IN_TRANSIT")} className="cursor-pointer">In Transit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("DELIVERED")} className="cursor-pointer">Delivered</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("CANCELLED")} className="cursor-pointer">Cancelled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          onClick={onManualOrderClick}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Manual Order
        </button>
      </div>
    </div>
  );
}
