import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ORDER_SERVICE_KINDS, type OrderServiceKind } from "@/components/shared/orderService";
import { useSupportOrderSearch } from "@/features/support/hooks/useSupportOrders";
import { SupportOrdersTable } from "@/features/support/components/orders/SupportOrdersTable";
import type { SupportStatusGroup } from "@/features/support/supportOrderTypes";

const PAGE_SIZE = 20;
const STATUS_GROUPS: SupportStatusGroup[] = ["active", "completed", "cancelled"];

/**
 * Support desk → Orders: find any order by id, phone number or name and open it
 * read-only. Filters live in the URL so an agent can share or reload a search.
 */
export default function SupportOrders() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const status = (params.get("status") || "") as SupportStatusGroup | "";
  const kind = (params.get("kind") || "") as OrderServiceKind | "";
  const page = Math.max(1, Number(params.get("page")) || 1);

  // The box is typed into freely; the search runs 400 ms after typing stops.
  const [typed, setTyped] = useState(q);
  useEffect(() => setTyped(q), [q]);
  useEffect(() => {
    if (typed === q) return;
    const timer = setTimeout(() => update({ q: typed.trim() }), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed]);

  const update = (next: Record<string, string>) => {
    const merged = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (value) merged.set(key, value);
      else merged.delete(key);
    }
    if (!("page" in next)) merged.delete("page");
    setParams(merged, { replace: true });
  };

  const { data, isLoading, isFetching, isError } = useSupportOrderSearch({
    q: q || undefined,
    status: status || undefined,
    kind: kind || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DashboardLayout searchPlaceholder={t("supportOrders.searchPlaceholder")}>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">{t("supportOrders.title")}</h1>
          <p className="page-subtitle">{t("supportOrders.subtitle")}</p>
        </div>

        <div className="section-card space-y-4 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={t("supportOrders.searchPlaceholder")}
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={status} onChange={(e) => update({ status: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option value="">{t("supportOrders.allStatuses")}</option>
              {STATUS_GROUPS.map((s) => (
                <option key={s} value={s}>{t(`supportOrders.statusGroup.${s}`)}</option>
              ))}
            </select>
            <select value={kind} onChange={(e) => update({ kind: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option value="">{t("service.all")}</option>
              {ORDER_SERVICE_KINDS.map((k) => (
                <option key={k} value={k}>{t(`service.${k}`)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="section-card">
          <SupportOrdersTable
            orders={data?.orders ?? []}
            isLoading={isLoading}
            emptyLabel={isError ? t("supportOrders.searchFailed") : q ? t("supportOrders.noMatches", { q }) : t("supportOrders.noOrders")}
          />
          <div className="flex items-center justify-between border-t border-border px-6 py-4 text-sm">
            <p className="text-muted-foreground">
              {t("supportOrders.resultCount", { count: total })}
              {isFetching && !isLoading ? ` · ${t("supportOrders.updating")}` : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => update({ page: String(page - 1) })}
                disabled={page <= 1}
                className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
              >
                {t("supportOrders.previous")}
              </button>
              <span className="text-muted-foreground">{t("supportOrders.pageOf", { page, pages })}</span>
              <button
                onClick={() => update({ page: String(page + 1) })}
                disabled={page >= pages}
                className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
              >
                {t("supportOrders.next")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
