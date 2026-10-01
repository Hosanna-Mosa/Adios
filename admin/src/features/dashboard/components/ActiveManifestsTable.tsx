import { motion, AnimatePresence } from "framer-motion";
import { Ban, Eye, MoreVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fadeIn } from "@/components/motion/variants";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ManifestItem } from "../types";

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-destructive text-destructive-foreground",
  STANDARD: "bg-muted text-muted-foreground",
  EXPRESS: "bg-primary text-primary-foreground",
};

const PRIORITY_LABEL_KEY: Record<string, string> = {
  HIGH: "dashboard.priorityHigh",
  STANDARD: "dashboard.priorityStandard",
  EXPRESS: "dashboard.priorityExpress",
};

function formatEta(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface ActiveManifestsTableProps {
  /** The manifests after the priority filter. */
  manifests: ManifestItem[];
  /** How many manifests exist before filtering (picks the empty-state message). */
  totalCount: number;
  isLoading?: boolean;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  onView: (m: ManifestItem) => void;
  onCancel: (m: ManifestItem) => void;
}

/**
 * The "Active Manifests" table: orders genuinely in flight right now, with a
 * working priority filter, View (opens the order) and Cancel (a real status
 * change). Hand-rolled rather than the shared DataTable for the
 * framer-motion row animations.
 */
export function ActiveManifestsTable({ manifests, totalCount, isLoading = false, priorityFilter, onPriorityFilterChange, onView, onCancel }: ActiveManifestsTableProps) {
  const { t } = useTranslation();
  return (
    <div className="section-card">
      <div className="flex items-center justify-between p-6 pb-4">
        <h3 className="text-lg font-semibold text-foreground">{t("dashboard.activeManifests")}</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{t("dashboard.filterByPriorityColon")}</span>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground"
          >
            <option value="ALL">{t("dashboard.allPriorities")}</option>
            <option value="HIGH">{t("dashboard.highPriorityOnly")}</option>
            <option value="EXPRESS">{t("dashboard.expressOnly")}</option>
            <option value="STANDARD">{t("dashboard.standardOnly")}</option>
          </select>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-t border-border">
            <th className="table-header-text text-left px-6 py-3">{t("dashboard.orderId")}</th>
            <th className="table-header-text text-left px-6 py-3">{t("dashboard.destination")}</th>
            <th className="table-header-text text-left px-6 py-3">{t("dashboard.driver")}</th>
            <th className="table-header-text text-left px-6 py-3">{t("dashboard.estimatedDelivery")}</th>
            <th className="table-header-text text-left px-6 py-3">{t("dashboard.priority")}</th>
            <th className="table-header-text text-left px-6 py-3">{t("dashboard.action")}</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout" initial={false}>
            {manifests.map((m) => (
              <motion.tr key={m.orderId || m.id} layout variants={fadeIn} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-primary">{m.id}</td>
                <td className="px-6 py-4 text-sm text-foreground">{m.dest || "—"}</td>
                <td className="px-6 py-4">
                  {m.driver ? (
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {m.driver
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="text-sm text-foreground">{m.driver}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">{t("dashboard.awaitingAssignment")}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{formatEta(m.eta)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${PRIORITY_STYLES[m.priority] || "bg-muted text-muted-foreground"}`}>{PRIORITY_LABEL_KEY[m.priority] ? t(PRIORITY_LABEL_KEY[m.priority]) : m.priority}</span>
                </td>
                <td className="px-6 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-muted rounded transition-colors">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(m)} className="gap-2 cursor-pointer">
                        <Eye className="h-4 w-4 text-muted-foreground" /> {t("dashboard.viewManifest")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onCancel(m)} className="gap-2 text-destructive focus:text-destructive cursor-pointer">
                        <Ban className="h-4 w-4" /> {t("dashboard.cancelManifest")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
      {!isLoading && manifests.length === 0 && (
        <p className="px-6 py-8 text-sm text-muted-foreground text-center">
          {totalCount === 0 ? t("dashboard.noActiveManifests") : t("dashboard.noManifestsMatchFilter")}
        </p>
      )}
    </div>
  );
}
