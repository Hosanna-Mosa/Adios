import { Map as MapIconMini, Plus, RefreshCw, ToggleLeft, ToggleRight, Eye, Pencil, Trash2, Clock, ShieldCheck, Flame } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import type { AdminZone } from "../types";

const TYPE_LABEL_KEY: Record<string, string> = {
  circle: "zones.circularRadius",
  polygon: "zones.polygonCustomShape",
};

interface ZoneListProps {
  zones: AdminZone[];
  isLoading: boolean;
  selectedZone: AdminZone | null;
  onSelectZone: (zone: AdminZone) => void;
  onToggleActive: (zone: AdminZone, e: React.MouseEvent) => void;
  onToggleAutoSurge: (zone: AdminZone, e: React.MouseEvent) => void;
  onEdit: (zone: AdminZone) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onCreateClick: () => void;
}

/** The "Operational Zones" table: click a row to preview it on the map. */
export function ZoneList({
  zones,
  isLoading,
  selectedZone,
  onSelectZone,
  onToggleActive,
  onToggleAutoSurge,
  onEdit,
  onDelete,
  onCreateClick,
}: ZoneListProps) {
  const { t } = useTranslation();
  const columns: DataTableColumn<AdminZone>[] = [
    {
      key: "details",
      header: t("zones.zoneDetails"),
      cell: (z) => {
        const isSelected = selectedZone?._id === z._id;
        return (
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              <MapIconMini className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{z.name}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[180px]">{z.description || t("zones.noDescription")}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      header: t("catalog.type"),
      cell: (z) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            z.type === "circle"
              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
          }`}
        >
          {t(TYPE_LABEL_KEY[z.type] || TYPE_LABEL_KEY.polygon)}
        </span>
      ),
    },
    {
      key: "pricing",
      header: t("zones.pricingBase"),
      cell: (z) => <span className="text-sm font-bold text-foreground">{z.pricingMultiplier}x</span>,
    },
    {
      key: "surge",
      header: t("zones.liveSurge"),
      cell: (z) =>
        z.autoSurgeEnabled ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 text-white text-xs font-bold animate-pulse shadow">
            <Flame className="h-3 w-3" /> {z.currentSurge || z.pricingMultiplier}x
          </span>
        ) : (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{t("zones.static")}</span>
        ),
    },
    {
      key: "supplyDemand",
      header: t("zones.supplyDemand"),
      cell: (z) => (
        <div className="flex flex-col text-xs text-foreground gap-0.5">
          <span>
            {t("zones.driversColon")} <span className="font-semibold text-success">{z.supplyCount || 0}</span>
          </span>
          <span>
            {t("zones.ordersColon")} <span className="font-semibold text-primary">{z.demandCount || 0}</span>
          </span>
        </div>
      ),
    },
    {
      key: "restrictions",
      header: t("zones.restrictions"),
      cell: (z) => {
        const hasTimeLimits = z.activeHours?.start && z.activeHours?.end;
        const hasServiceLimits = z.allowedServices && z.allowedServices.length > 0;
        return (
          <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
            {hasTimeLimits && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-amber-500" /> {z.activeHours!.start} - {z.activeHours!.end}
              </span>
            )}
            {hasServiceLimits ? (
              <span className="flex items-center gap-1 truncate max-w-[120px]" title={z.allowedServices!.join(", ")}>
                <ShieldCheck className="h-3 w-3 text-indigo-500" /> {z.allowedServices!.join(", ")}
              </span>
            ) : (
              <span className="text-[10px] bg-muted/60 px-1.5 py-0.5 rounded w-max text-muted-foreground">{t("zones.allServices")}</span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: t("users.status"),
      cell: (z) => (
        <button onClick={(e) => onToggleActive(z, e)} className="flex items-center gap-1.5 focus:outline-none">
          {z.isActive ? (
            <>
              <ToggleRight className="h-6 w-6 text-success" />
              <span className="text-xs font-semibold text-success">{t("zones.live")}</span>
            </>
          ) : (
            <>
              <ToggleLeft className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground">{t("zones.disabled")}</span>
            </>
          )}
        </button>
      ),
    },
    {
      key: "autoSurge",
      header: t("zones.autoSurge"),
      cell: (z) => (
        <button onClick={(e) => onToggleAutoSurge(z, e)} className="flex items-center gap-1.5 focus:outline-none" title={t("zones.toggleAutoSurgePricing")}>
          {z.autoSurgeEnabled ? (
            <>
              <ToggleRight className="h-6 w-6 text-amber-500" />
              <span className="text-xs font-semibold text-amber-500">{t("zones.auto")}</span>
            </>
          ) : (
            <>
              <ToggleLeft className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground">{t("zones.static")}</span>
            </>
          )}
        </button>
      ),
    },
    {
      key: "actions",
      header: t("orders.action"),
      cell: (z) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectZone(z);
            }}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
            title={t("zones.viewOnMap")}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(z);
            }}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
            title={t("zones.editZone")}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={(e) => onDelete(z._id, e)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors" title={t("zones.deleteZone")}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="lg:col-span-2 section-card flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t("zones.operationalZones")}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{t("zones.defineCoordinatesPricingDesc")}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onCreateClick} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" /> {t("zones.createZone")}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={zones}
            rowKey={(z) => z._id}
            isLoading={isLoading}
            loadingLabel={
              <>
                <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                {t("zones.loadingZones")}
              </>
            }
            emptyLabel={t("zones.noOperationalZonesFoundDesc")}
            onRowClick={onSelectZone}
            rowClassName={(z) =>
              `border-t border-border hover:bg-muted/30 transition-colors cursor-pointer ${
                selectedZone?._id === z._id ? "bg-primary/5 border-l-4 border-l-primary" : ""
              }`
            }
          />
        </div>
      </div>
    </div>
  );
}
