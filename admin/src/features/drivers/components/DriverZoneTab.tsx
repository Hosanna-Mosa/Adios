import { MessageSquare, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LazyImage } from "@/components/shared/LazyImage";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import type { AdminDriver, AdminZone } from "../types";

interface DriverWithZoneRow extends AdminDriver {
  __zoneObj?: AdminZone;
}

const HEADER_CLASS = "text-left px-6 py-3.5";
const CELL_CLASS = "px-6 py-4";

interface DriverZoneTabProps {
  drivers: AdminDriver[];
  zonesList: AdminZone[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  getAvatarUrl: (name: string) => string;
  getVehicleString: (driver: AdminDriver) => string;
  onAssignClick: () => void;
  onEditClick: (driverId: string, currentZoneId: string) => void;
  onRemoveZone: (driverId: string, driverName?: string) => void;
  onOpenChatModal: (driver: AdminDriver) => void;
}

/** The "Zone Assignments" tab: its own search/table, separate from the Fleet Directory tab. */
export function DriverZoneTab({
  drivers,
  zonesList,
  searchQuery,
  onSearchChange,
  getAvatarUrl,
  getVehicleString,
  onAssignClick,
  onEditClick,
  onRemoveZone,
  onOpenChatModal,
}: DriverZoneTabProps) {
  const rows: DriverWithZoneRow[] = drivers.map((d) => {
    const assignedZoneId =
      typeof d.preferredZone === "object" && d.preferredZone ? d.preferredZone._id : d.preferredZone;
    const zoneObj = zonesList.find((z) => z._id === assignedZoneId);
    return { ...d, __zoneObj: zoneObj };
  });

  const columns: DataTableColumn<DriverWithZoneRow>[] = [
    {
      key: "driver",
      header: "Driver",
      headerClassName: HEADER_CLASS,
      cellClassName: CELL_CLASS,
      cell: (d) => (
        <div className="flex items-center gap-3">
          <LazyImage
            src={getAvatarUrl(d.user?.name || "")}
            alt={d.user?.name}
            className="h-10 w-10 rounded-full object-cover border border-border"
            wrapperClassName="h-10 w-10 rounded-full shrink-0"
          />
          <div>
            <p className="text-sm font-bold text-foreground">{d.user?.name}</p>
            <p className="text-[10px] font-medium text-muted-foreground uppercase">{getVehicleString(d)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      headerClassName: HEADER_CLASS,
      cellClassName: CELL_CLASS,
      cell: (d) => (
        <>
          <p className="text-sm font-medium text-foreground">{d.user?.phone || "N/A"}</p>
          <p className="text-xs text-muted-foreground">{d.user?.email || "N/A"}</p>
        </>
      ),
    },
    {
      key: "zone",
      header: "Assigned Zone",
      headerClassName: HEADER_CLASS,
      cellClassName: CELL_CLASS,
      cell: (d) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            d.__zoneObj ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-zinc-50 text-zinc-500 border border-zinc-100"
          }`}
        >
          {d.__zoneObj ? d.__zoneObj.name : "No Zone Assigned"}
        </span>
      ),
    },
    {
      key: "zoneType",
      header: "Zone Type",
      headerClassName: HEADER_CLASS,
      cellClassName: "px-6 py-4 text-sm text-muted-foreground",
      cell: (d) => (d.__zoneObj ? d.__zoneObj.type : "N/A"),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: HEADER_CLASS,
      cellClassName: CELL_CLASS,
      cell: (d) => {
        const assignedZoneId =
          typeof d.preferredZone === "object" && d.preferredZone ? d.preferredZone._id : d.preferredZone;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditClick(d._id, assignedZoneId || "")}
              className="px-3 py-1.5 border border-border bg-white text-xs font-semibold rounded-lg text-foreground hover:bg-muted/50 transition-colors shadow-sm"
            >
              Edit
            </button>
            {d.__zoneObj && (
              <button
                onClick={() => onRemoveZone(d._id, d.user?.name)}
                className="px-3 py-1.5 border border-transparent bg-rose-50 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-100 transition-colors"
              >
                Delete
              </button>
            )}
            <button
              onClick={() => onOpenChatModal(d)}
              className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="View Order Chats"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Zone Assignments</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and link drivers to operational regions/zones.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search drivers..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-muted/30 border-border"
            />
          </div>
          <button
            onClick={onAssignClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Assign Zone to Driver
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={rows}
          rowKey={(d) => d._id}
          emptyLabel="No drivers found matching the search query."
          headerRowClassName="border-t border-border bg-muted/20 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold"
          rowClassName="hover:bg-muted/10 transition-colors"
          stateCellClassName="px-6 py-12 text-center text-muted-foreground text-sm"
          tbodyClassName="divide-y divide-border"
        />
      </div>
    </div>
  );
}
