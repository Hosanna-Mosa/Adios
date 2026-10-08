import { Layers, SlidersHorizontal } from "lucide-react";
import { ORDER_SERVICE_KINDS, type OrderServiceKind } from "@/components/shared/orderService";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LiveOrdersHeaderProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  serviceFilter: OrderServiceKind | "ALL";
  setServiceFilter: (value: OrderServiceKind | "ALL") => void;
}

const STATUS_FILTER_LABEL_KEY: Record<string, string> = {
  ALL: "dashboard.allStatuses",
  SEARCHING_DRIVER: "orderStatus.searchingDriver",
  DRIVER_ASSIGNED: "orderStatus.driverAssigned",
  IN_TRANSIT: "orders.inTransit",
  DELIVERED: "orderStatus.delivered",
  CANCELLED: "orders.cancelled",
};

/** The title + status filter on LiveOrders.tsx. */
export function LiveOrdersHeader({ statusFilter, setStatusFilter, serviceFilter, setServiceFilter }: LiveOrdersHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="page-header">{t("orders.liveOrders")}</h1>
        <p className="page-subtitle">{t("orders.realTimeMonitoringShipmentsDesc")}</p>
      </div>
      <div className="flex gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
              <Layers className="h-4 w-4" /> {t("service.filterColon", { value: serviceFilter === "ALL" ? t("service.all") : t(`service.${serviceFilter}`) })}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setServiceFilter("ALL")} className="cursor-pointer">{t("service.all")}</DropdownMenuItem>
            {ORDER_SERVICE_KINDS.map((kind) => (
              <DropdownMenuItem key={kind} onClick={() => setServiceFilter(kind)} className="cursor-pointer">{t(`service.${kind}`)}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
              <SlidersHorizontal className="h-4 w-4" /> {t("common.filterColon", { value: STATUS_FILTER_LABEL_KEY[statusFilter] ? t(STATUS_FILTER_LABEL_KEY[statusFilter]) : statusFilter, defaultValue: "Filter: {{value}}" })}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter("ALL")} className="cursor-pointer">{t("dashboard.allStatuses")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("SEARCHING_DRIVER")} className="cursor-pointer">{t("orderStatus.searchingDriver")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("DRIVER_ASSIGNED")} className="cursor-pointer">{t("orderStatus.driverAssigned")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("IN_TRANSIT")} className="cursor-pointer">{t("orders.inTransit")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("DELIVERED")} className="cursor-pointer">{t("orderStatus.delivered")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("CANCELLED")} className="cursor-pointer">{t("orders.cancelled")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
