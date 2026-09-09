import { Drumstick, MoreVertical, Star, Edit2, Trash2, Eye } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { AvailabilityPill } from "@/components/shared/AvailabilityPill";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { MeatCenter } from "../meatCenterTypes";

const HEADER_CLASS = "text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground";

interface MeatCenterTableProps {
  centers: MeatCenter[];
  isLoading: boolean;
  onViewClick: (center: MeatCenter) => void;
  onEditClick: (center: MeatCenter) => void;
  onDeleteClick: (center: MeatCenter) => void;
}

/** The meat-center list table. */
export function MeatCenterTable({ centers, isLoading, onViewClick, onEditClick, onDeleteClick }: MeatCenterTableProps) {
  const columns: DataTableColumn<MeatCenter>[] = [
    {
      key: "name",
      header: "Center Name",
      headerClassName: HEADER_CLASS,
      cell: (center) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
            <Drumstick className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-sm font-medium">{center.name}</p>
        </div>
      ),
    },
    {
      key: "address",
      header: "Address",
      headerClassName: HEADER_CLASS,
      cell: (center) => <p className="text-sm text-muted-foreground max-w-[250px] truncate">{center.address}</p>,
    },
    {
      key: "rating",
      header: "Rating",
      headerClassName: HEADER_CLASS,
      cell: (center) => (
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium">{center.rating}</span>
          <span className="text-xs text-muted-foreground">({center.reviews})</span>
        </div>
      ),
    },
    {
      key: "availability",
      header: "Availability",
      headerClassName: HEADER_CLASS,
      cell: (center) => <AvailabilityPill openState={center.openState} isManuallyClosed={center.isManuallyClosed} />,
    },
    {
      key: "contact",
      header: "Contact",
      headerClassName: HEADER_CLASS,
      cell: (center) => <p className="text-sm">{center.phone}</p>,
    },
    {
      key: "action",
      header: "Action",
      headerClassName: HEADER_CLASS,
      cell: (center) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-muted rounded transition-colors">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewClick(center)} className="gap-2 cursor-pointer">
              <Eye className="h-4 w-4 text-muted-foreground" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditClick(center)} className="gap-2 cursor-pointer">
              <Edit2 className="h-4 w-4 text-muted-foreground" /> Edit Center
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteClick(center)} className="gap-2 text-destructive focus:text-destructive cursor-pointer">
              <Trash2 className="h-4 w-4" /> Delete Center
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="section-card bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <DataTable
        columns={columns}
        data={centers}
        rowKey={(center) => center._id}
        isLoading={isLoading}
        loadingLabel="Loading..."
        emptyLabel={<span className="text-muted-foreground">No meat centers found.</span>}
        stateCellClassName="px-6 py-10 text-center"
        headerRowClassName="bg-muted/50 border-b border-border"
        rowClassName="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
      />
    </div>
  );
}
