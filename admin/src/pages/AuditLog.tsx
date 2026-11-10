import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, ScrollText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { useAuditLog, type AuditEntry } from "@/features/audit/useAuditLog";

const TARGET_TYPES = ["User", "Driver", "Vendor", "MeatCenter", "Coupon", "Zone", "Banner", "Offer", "SystemConfig", "SupportTicket", "orders", "refunds", "payouts", "support-members", "broadcasts"];

function Json({ label, value }: { label: string; value: unknown }) {
  if (value === undefined || value === null) return null;
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <pre className="text-xs bg-muted/40 rounded-lg p-3 overflow-auto max-h-56 whitespace-pre-wrap break-words">{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}

function Row({ entry, open, onToggle }: { entry: AuditEntry; open: boolean; onToggle: () => void }) {
  const { t, i18n } = useTranslation();
  return (
    <Fragment>
      <tr className="border-b border-border hover:bg-muted/30 cursor-pointer" onClick={onToggle}>
        <td className="px-4 py-3 text-muted-foreground">{open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</td>
        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{new Date(entry.createdAt).toLocaleString(i18n.language)}</td>
        <td className="px-4 py-3">
          <p className="font-semibold text-foreground">{entry.actorName || entry.actorId}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{entry.actorRole}</p>
        </td>
        <td className="px-4 py-3 font-mono text-xs text-foreground">{entry.action}</td>
        <td className="px-4 py-3 text-foreground">
          {entry.targetType || "—"}
          {entry.targetId && <p className="font-mono text-[11px] text-muted-foreground">{entry.targetId}</p>}
        </td>
      </tr>
      {open && (
        <tr className="border-b border-border bg-muted/10">
          <td />
          <td colSpan={4} className="px-4 py-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Json label={t("auditLog.before", "Before")} value={entry.before} />
              <Json label={t("auditLog.after", "After")} value={entry.after} />
              <Json label={t("auditLog.request", "Request")} value={entry.request} />
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              {entry.method} {entry.path} · HTTP {entry.statusCode}
              {entry.ip ? ` · ${entry.ip}` : ""}
            </p>
          </td>
        </tr>
      )}
    </Fragment>
  );
}

export default function AuditLog() {
  const { t } = useTranslation();
  const a = useAuditLog();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <DashboardLayout searchPlaceholder={t("auditLog.search", "Search the audit log")}>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">{t("auditLog.title", "Audit log")}</h1>
          <p className="page-subtitle">{t("auditLog.subtitle", "Every change an admin or support member makes — who, what, and the values before and after. Entries cannot be edited or deleted.")}</p>
        </div>

        <div className="section-card p-4 grid gap-3 md:grid-cols-5">
          <Input value={a.filters.actor} onChange={(e) => a.setFilter("actor", e.target.value)} placeholder={t("auditLog.actor", "Person (name or id)")} />
          <Input value={a.filters.action} onChange={(e) => a.setFilter("action", e.target.value)} placeholder={t("auditLog.action", "Action, e.g. PUT /admin/drivers")} />
          <select
            value={a.filters.targetType}
            onChange={(e) => a.setFilter("targetType", e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{t("auditLog.anyTarget", "Any target")}</option>
            {TARGET_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <Input type="date" value={a.filters.from} onChange={(e) => a.setFilter("from", e.target.value)} aria-label={t("auditLog.from", "From")} />
          <Input type="date" value={a.filters.to} onChange={(e) => a.setFilter("to", e.target.value)} aria-label={t("auditLog.to", "To")} />
        </div>

        <div className="section-card overflow-hidden">
          {a.isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : a.entries.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-muted-foreground">
              <ScrollText className="h-10 w-10 mb-3 text-muted-foreground/40" />
              <p className="font-semibold text-foreground">{t("auditLog.empty", "No matching activity")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="px-4 py-3 w-8" />
                    <th className="px-4 py-3 font-bold">{t("auditLog.when", "When")}</th>
                    <th className="px-4 py-3 font-bold">{t("auditLog.who", "Who")}</th>
                    <th className="px-4 py-3 font-bold">{t("auditLog.whatDone", "Action")}</th>
                    <th className="px-4 py-3 font-bold">{t("auditLog.target", "Target")}</th>
                  </tr>
                </thead>
                <tbody>
                  {a.entries.map((entry) => (
                    <Row key={entry._id} entry={entry} open={openId === entry._id} onToggle={() => setOpenId(openId === entry._id ? null : entry._id)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
            <span>{t("auditLog.total", { count: a.total, defaultValue: "{{count}} entries" })}</span>
            <div className="flex items-center gap-2">
              <button disabled={a.page <= 1} onClick={() => a.setPage(a.page - 1)} className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40">
                {t("common.previous", "Previous")}
              </button>
              <span>
                {a.page} / {a.pages}
              </span>
              <button disabled={a.page >= a.pages} onClick={() => a.setPage(a.page + 1)} className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40">
                {t("common.next", "Next")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
