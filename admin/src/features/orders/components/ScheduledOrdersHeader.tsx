import { SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
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

const STATUS_FILTER_LABEL_KEY: Record<"ALL" | ScheduleStatus, string> = {
  ALL: "orders.allRequests",
  pending: "orders.statusPending",
  accepted: "orders.statusAccepted",
  rejected: "orders.statusRejected",
};

/** The title + status filter dropdown on ScheduledOrders.tsx. */
export function ScheduledOrdersHeader({ statusFilter, onFilterChange }: ScheduledOrdersHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="page-header">{t("orders.scheduledOrders")}</h1>
        <p className="page-subtitle">{t("orders.approveDeclineBookedSlotsDesc")}</p>
      </div>
      <div className="flex gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
              <SlidersHorizontal className="h-4 w-4" /> {t("common.filterColon", { value: t(STATUS_FILTER_LABEL_KEY[statusFilter]), defaultValue: "Filter: {{value}}" })}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onFilterChange("ALL")} className="cursor-pointer">{t("orders.allRequests")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("pending")} className="cursor-pointer">{t("orders.statusPending")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("accepted")} className="cursor-pointer">{t("orders.statusAccepted")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("rejected")} className="cursor-pointer">{t("orders.statusRejected")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
