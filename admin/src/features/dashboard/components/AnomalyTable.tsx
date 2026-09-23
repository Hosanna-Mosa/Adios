import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { fadeIn } from "@/components/motion/variants";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Anomaly } from "../analyticsTypes";

interface AnomalyTableProps {
  anomalies: Anomaly[];
}

/**
 * The "Real-time Anomaly Detection" table. Hand-rolled rather than the
 * shared DataTable, same reasoning as Dashboard's ActiveManifestsTable
 * (item #15): the original never renders a loading or empty-results row,
 * and DataTable always would if `anomalies` were ever an empty array.
 */
export function AnomalyTable({ anomalies }: AnomalyTableProps) {
  const { t } = useTranslation();
  return (
    <div className="section-card">
      <div className="flex items-center justify-between p-6 pb-4">
        <h3 className="text-lg font-semibold text-foreground">{t("analytics.realTimeAnomalyDetection")}</h3>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
          <span className="text-xs font-medium text-primary">{t("analytics.liveFeed")}</span>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-t border-border">
            <th className="table-header-text text-left px-6 py-3">{t("analytics.shipmentId")}</th>
            <th className="table-header-text text-left px-6 py-3">{t("analytics.routeStatus")}</th>
            <th className="table-header-text text-left px-6 py-3">{t("dashboard.driver")}</th>
            <th className="table-header-text text-left px-6 py-3">{t("analytics.estValue")}</th>
            <th className="table-header-text text-left px-6 py-3">{t("analytics.activity")}</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout" initial={false}>
            {anomalies.map((a) => (
              <motion.tr key={a.id} layout variants={fadeIn} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">{a.id}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={a.status} variant={a.statusVariant} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-muted" />
                    <span className="text-sm text-foreground">{a.driver}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-foreground">{a.value}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{a.activity}</td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
      <div className="p-4 text-center border-t border-border">
        <button onClick={() => toast.info(t("analytics.noOlderAnomalies"))} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          {t("analytics.viewAllInsights")}
        </button>
      </div>
    </div>
  );
}
