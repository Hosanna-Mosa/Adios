import { ReactNode } from "react";
import { Store, MoreVertical, Star, Edit2, Trash2, Eye } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AvailabilityPill } from "./AvailabilityPill";
import type { Vendor } from "../types";

const STATUS_BADGE_CLASS: Record<string, string> = {
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  submitted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};
const DEFAULT_STATUS_BADGE_CLASS = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";

interface VendorTableProps {
  vendors: Vendor[];
  isLoading: boolean;
  emptyLabel: ReactNode;
  onViewClick: (vendor: Vendor) => void;
  onEditClick: (vendor: Vendor) => void;
  onDeleteClick: (vendor: Vendor) => void;
}

/** The vendor list table. */
export function VendorTable({ vendors, isLoading, emptyLabel, onViewClick, onEditClick, onDeleteClick }: VendorTableProps) {
  const columns: DataTableColumn<Vendor>[] = [
    {
      key: "restaurant",
      header: "Restaurant",
      cell: (vendor) => {
        const status = vendor.onboardingStatus || "draft";
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{vendor.name}</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${STATUS_BADGE_CLASS[status] ?? DEFAULT_STATUS_BADGE_CLASS}`}>{status}</span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase">{vendor.isPureVeg ? "Pure Veg" : "Multi-Cuisine"}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "location",
      header: "Location",
      cell: (vendor) => <p className="text-sm text-foreground max-w-[200px] truncate">{vendor.address}</p>,
    },
    {
      key: "rating",
      header: "Rating",
      cell: (vendor) => (
        <div className="flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-warning fill-warning" />
          <span className="text-sm font-medium text-foreground">{vendor.rating}</span>
          <span className="text-xs text-muted-foreground">({vendor.reviews})</span>
        </div>
      ),
    },
    {
      key: "availability",
      header: "Availability",
      cell: (vendor) => <AvailabilityPill openState={vendor.openState} isManuallyClosed={vendor.isManuallyClosed} />,
    },
    {
      key: "contact",
      header: "Contact",
      cell: (vendor) => (
        <>
          <p className="text-sm text-foreground">{vendor.phone}</p>
          <p className="text-xs text-muted-foreground">{vendor.email}</p>
        </>
      ),
    },
    {
      key: "action",
      header: "Action",
      cell: (vendor) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-muted rounded transition-colors">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewClick(vendor)} className="gap-2 cursor-pointer">
              <Eye className="h-4 w-4 text-muted-foreground" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditClick(vendor)} className="gap-2 cursor-pointer">
              <Edit2 className="h-4 w-4 text-muted-foreground" /> Edit Restaurant
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteClick(vendor)} className="gap-2 text-destructive focus:text-destructive cursor-pointer">
              <Trash2 className="h-4 w-4" /> Delete Restaurant
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={vendors}
      rowKey={(vendor) => vendor._id}
      isLoading={isLoading}
      loadingLabel="Loading vendors..."
      emptyLabel={emptyLabel}
      headerRowClassName="bg-muted/50"
    />
  );
}
