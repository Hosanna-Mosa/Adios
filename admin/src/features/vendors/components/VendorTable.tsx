import { ReactNode } from "react";
import { Store, MoreVertical, Star, Edit2, Trash2, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AvailabilityPill } from "@/components/shared/AvailabilityPill";
import type { Vendor } from "../types";

// Vendor onboarding state as its own column. It used to be a 9px badge wedged
// beside the restaurant name, which is easy to miss on a row that also carries
// a rating and an availability pill. The four values are the ones the Vendor
// model actually defines.
const STATUS_PILL_CLASS: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  rejected: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900",
  submitted: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  resubmission_required: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
  draft: "bg-muted text-muted-foreground border-border",
};
const STATUS_LABEL_KEY: Record<string, string> = {
  approved: "catalog.approved",
  rejected: "catalog.rejected",
  submitted: "catalog.submitted",
  resubmission_required: "catalog.resubmissionRequired",
  draft: "catalog.draft",
};

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
  const { t } = useTranslation();
  const columns: DataTableColumn<Vendor>[] = [
    {
      key: "restaurant",
      header: t("catalog.restaurant"),
      cell: (vendor) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{vendor.name}</p>
            <p className="text-[10px] text-muted-foreground uppercase">{vendor.isPureVeg ? t("catalog.pureVeg") : t("catalog.multiCuisine")}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: t("catalog.status"),
      cell: (vendor) => {
        const status = vendor.onboardingStatus || "draft";
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold capitalize ${STATUS_PILL_CLASS[status] ?? STATUS_PILL_CLASS.draft}`}>
            {STATUS_LABEL_KEY[status] ? t(STATUS_LABEL_KEY[status]) : status}
          </span>
        );
      },
    },
    {
      key: "location",
      header: t("catalog.location"),
      cell: (vendor) => <p className="text-sm text-foreground max-w-[200px] truncate">{vendor.address}</p>,
    },
    {
      key: "rating",
      header: t("catalog.rating"),
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
      header: t("catalog.availability"),
      cell: (vendor) => <AvailabilityPill openState={vendor.openState} isManuallyClosed={vendor.isManuallyClosed} />,
    },
    {
      key: "contact",
      header: t("catalog.contact"),
      cell: (vendor) => (
        <>
          <p className="text-sm text-foreground">{vendor.phone}</p>
          <p className="text-xs text-muted-foreground">{vendor.email}</p>
        </>
      ),
    },
    {
      key: "action",
      header: t("orders.action"),
      cell: (vendor) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-muted rounded transition-colors">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewClick(vendor)} className="gap-2 cursor-pointer">
              <Eye className="h-4 w-4 text-muted-foreground" /> {t("catalog.viewDetails")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditClick(vendor)} className="gap-2 cursor-pointer">
              <Edit2 className="h-4 w-4 text-muted-foreground" /> {t("catalog.editRestaurant")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteClick(vendor)} className="gap-2 text-destructive focus:text-destructive cursor-pointer">
              <Trash2 className="h-4 w-4" /> {t("catalog.deleteRestaurant")}
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
      loadingLabel={t("catalog.loadingVendors")}
      emptyLabel={emptyLabel}
      headerRowClassName="bg-muted/50"
    />
  );
}
