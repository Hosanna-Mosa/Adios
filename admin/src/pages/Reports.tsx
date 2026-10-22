import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { downloadFile } from "@/lib/download";

const REPORTS = [
  { kind: "orders", title: "Orders", desc: "Every order with service, status, total, payment and customer." },
  { kind: "drivers", title: "Drivers", desc: "Drivers with vehicle, status, onboarding stage and whether they are blocked." },
  { kind: "users", title: "Customers", desc: "Customer accounts with contact details and status." },
  { kind: "vendors", title: "Vendors", desc: "Restaurants and meat centres with type, contact, rating and open state." },
] as const;

export default function Reports() {
  const { t } = useTranslation();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const download = async (kind: string) => {
    setBusy(kind);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", `${to}T23:59:59.999`);
      await downloadFile(`/admin/reports/${kind}?${params.toString()}`, `${kind}.csv`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <DashboardLayout searchPlaceholder={t("reports.search", "Search")}>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">{t("reports.title", "Reports")}</h1>
          <p className="page-subtitle">{t("reports.subtitle", "Download CSV exports. Each download is recorded in the audit log, because the files contain personal details.")}</p>
        </div>

        <div className="section-card p-4 flex flex-wrap items-end gap-4">
          <label className="text-xs font-semibold text-muted-foreground">
            {t("reports.from", "Created from")}
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-44" />
          </label>
          <label className="text-xs font-semibold text-muted-foreground">
            {t("reports.to", "Created until")}
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-44" />
          </label>
          <p className="text-xs text-muted-foreground pb-2">{t("reports.rangeHint", "Leave empty for everything (up to 20,000 newest rows).")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {REPORTS.map((report) => (
            <div key={report.kind} className="section-card p-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-foreground">{t(`reports.${report.kind}`, report.title)}</h3>
                <p className="text-sm text-muted-foreground">{t(`reports.${report.kind}Desc`, report.desc)}</p>
              </div>
              <button
                type="button"
                onClick={() => download(report.kind)}
                disabled={busy !== null}
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 disabled:opacity-50"
              >
                {busy === report.kind ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                CSV
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
