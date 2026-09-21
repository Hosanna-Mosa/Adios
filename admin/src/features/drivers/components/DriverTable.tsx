import { Eye, Phone, MessageSquare, MapPin, MoreVertical, Star } from "lucide-react";
import { toast } from "sonner";
import { LazyImage } from "@/components/shared/LazyImage";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminDriver } from "../types";

const HEADER_CLASS = "text-left px-6 py-3.5";
const CELL_CLASS = "px-6 py-4";

interface DriverTableProps {
  drivers: AdminDriver[];
  isLoading: boolean;
  getAvatarUrl: (name: string) => string;
  getLocationDetails: (driver: AdminDriver) => { main: string; sub: string };
  getVehicleString: (driver: AdminDriver) => string;
  onViewClick: (driver: AdminDriver) => void;
  onFocusOnMap: (driver: AdminDriver) => void;
  onOpenChatModal: (driver: AdminDriver) => void;
  onToggleStatus: (driver: AdminDriver) => void;
  onToggleBlock: (driver: AdminDriver) => void;
  onDeleteClick: (driver: AdminDriver) => void;
}

/** The Fleet Directory tab's driver table, built on the shared DataTable. */
export function DriverTable({
  drivers,
  isLoading,
  getAvatarUrl,
  getLocationDetails,
  getVehicleString,
  onViewClick,
  onFocusOnMap,
  onOpenChatModal,
  onToggleStatus,
  onToggleBlock,
  onDeleteClick,
}: DriverTableProps) {
  const columns: DataTableColumn<AdminDriver>[] = [
    {
      key: "details",
      header: "Driver Details",
      headerClassName: HEADER_CLASS,
      cellClassName: CELL_CLASS,
      cell: (d) => (
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <LazyImage
              src={getAvatarUrl(d.user?.name || "")}
              alt={d.user?.name}
              className="h-10 w-10 rounded-full object-cover border border-border"
              wrapperClassName="h-10 w-10 rounded-full shrink-0"
            />
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-card ${
                d.status?.toUpperCase() === "ONLINE"
                  ? "bg-emerald-500"
                  : d.status?.toUpperCase() === "BUSY"
                    ? "bg-amber-500"
                    : "bg-zinc-400"
              }`}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                onClick={() => onViewClick(d)}
                className="text-sm font-bold text-foreground hover:text-primary cursor-pointer transition-colors leading-none truncate"
              >
                {d.user?.name}
              </span>
              {d.user?.isBlocked && (
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[8px] font-bold uppercase shrink-0">
                  Blocked
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-none">{d.user?.phone || "+91 00000 00000"}</p>
            <p className="text-[10px] font-medium text-muted-foreground mt-1 leading-none uppercase">{getVehicleString(d)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      headerClassName: HEADER_CLASS,
      cellClassName: CELL_CLASS,
      cell: (d) => (
        <div className="flex items-center">
          {d.status?.toUpperCase() === "ONLINE" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Online
            </span>
          )}
          {d.status?.toUpperCase() === "BUSY" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100/50">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Busy
            </span>
          )}
          {d.status?.toUpperCase() !== "ONLINE" && d.status?.toUpperCase() !== "BUSY" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-50 text-zinc-600 border border-zinc-100">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
              Offline
            </span>
          )}
        </div>
      ),
    },
    {
      key: "location",
      header: "Current Location",
      headerClassName: HEADER_CLASS,
      cellClassName: CELL_CLASS,
      cell: (d) => {
        const loc = getLocationDetails(d);
        return (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground leading-none">{loc.main}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 leading-none">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {loc.sub}
            </p>
            <button onClick={() => onFocusOnMap(d)} className="text-[11px] text-[#00665c] font-bold hover:underline leading-none block pt-0.5">
              View on map
            </button>
          </div>
        );
      },
    },
    {
      key: "earnings",
      header: "Earnings (MTD)",
      headerClassName: HEADER_CLASS,
      cellClassName: CELL_CLASS,
      cell: () => (
        <div>
          <p className="text-sm font-bold text-foreground">₹0.00</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Target: ₹0</p>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      headerClassName: HEADER_CLASS,
      cellClassName: CELL_CLASS,
      cell: (d) => (
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-foreground">{d.rating || "4.8"}</span>
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: HEADER_CLASS,
      cellClassName: CELL_CLASS,
      cell: (d) => (
        <div className="flex items-center gap-2">
          <button onClick={() => onViewClick(d)} className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="View Dossier">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={() => toast.success(`Calling ${d.user?.name}...`)} className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Call">
            <Phone className="h-4 w-4" />
          </button>
          <button onClick={() => onOpenChatModal(d)} className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="View Order Chats">
            <MessageSquare className="h-4 w-4" />
          </button>
          <button onClick={() => onFocusOnMap(d)} className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Pin on Map">
            <MapPin className="h-4 w-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => onToggleStatus(d)} className="cursor-pointer">
                Toggle On/Off Duty
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleBlock(d)} className="cursor-pointer">
                {d.user?.isBlocked ? "Unblock Account" : "Block Account"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteClick(d)} className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                Delete Registration
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={drivers}
      rowKey={(d) => d._id}
      isLoading={isLoading}
      loadingLabel="Loading drivers..."
      emptyLabel="No drivers found matching the filter."
      headerRowClassName="border-t border-border bg-muted/20 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold"
      rowClassName="hover:bg-muted/10 transition-colors"
      stateCellClassName="px-6 py-12 text-center text-muted-foreground text-sm"
      tbodyClassName="divide-y divide-border"
    />
  );
}
