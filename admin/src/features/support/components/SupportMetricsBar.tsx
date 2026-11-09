import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api-client";
import { downloadFile } from "@/lib/download";
import { useStaffPermissions } from "../hooks/useStaffPermissions";
import { formatMinutes, type SupportMetrics } from "../supportExtras";

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: "bad" }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 min-w-[140px]">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-xl font-extrabold ${tone === "bad" ? "text-red-600" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

/** Support metrics — volumes, response and resolution times, SLA breaches, each agent's backlog — and the CSV export. */
export function SupportMetricsBar() {
  const { t } = useTranslation();
  const { can } = useStaffPermissions();
  const [exporting, setExporting] = useState(false);
  const { data } = useQuery({
    queryKey: ["admin", "tickets", "metrics"],
    queryFn: () => adminFetch<SupportMetrics>("/admin/tickets/metrics"),
    refetchInterval: 60_000,
  });

  const exportCsv = async () => {
    setExporting(true);
    try {
      await downloadFile("/admin/tickets/export", "support-tickets.csv");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setExporting(false);
    }
  };

  if (!data) return null;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-stretch gap-3">
        <Stat label={t("supportTools.metrics.open", "Open")} value={(data.byStatus.OPEN ?? 0) + (data.byStatus.PENDING_RESOLVE ?? 0)} />
        <Stat label={t("supportTools.metrics.avgFirstReply", "Avg first reply")} value={formatMinutes(data.avgFirstResponseMinutes)} />
        <Stat label={t("supportTools.metrics.avgResolution", "Avg resolution")} value={formatMinutes(data.avgResolutionMinutes)} />
        <Stat label={t("supportTools.metrics.firstReplyBreaches", "First-reply SLA breaches")} value={data.firstResponseBreached} tone={data.firstResponseBreached ? "bad" : undefined} />
        <Stat label={t("supportTools.metrics.resolutionBreaches", "Resolution SLA breaches")} value={data.resolutionBreached} tone={data.resolutionBreached ? "bad" : undefined} />
        {can("export") && (
          <button
            type="button"
            onClick={exportCsv}
            disabled={exporting}
            className="ml-auto inline-flex items-center gap-2 self-center px-4 py-2.5 rounded-lg border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 disabled:opacity-50"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {t("supportTools.exportTickets", "Export tickets (CSV)")}
          </button>
        )}
      </div>
      {data.agentBacklog.length > 0 && (
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{t("supportTools.metrics.backlog", "Backlog")}:</span>{" "}
          {data.agentBacklog.map((a) => `${a.name} ${a.open}`).join(" · ")}
        </p>
      )}
    </div>
  );
}
