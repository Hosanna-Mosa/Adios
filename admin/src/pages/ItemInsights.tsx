import { useState } from "react";
import { ArrowDown, ArrowUp, Download, IndianRupee, MousePointerClick, Package, Search, ShoppingCart, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ITEM_PERIOD_OPTIONS, useItemStats } from "@/features/activity/hooks/useItemStats";
import type { ItemSortKey, ItemStatRow } from "@/features/activity/types";

const ALL_OUTLETS = "__all__";

const COLUMNS: { key: ItemSortKey; label: string; hint: string; numeric?: boolean }[] = [
  { key: "name", label: "Item", hint: "Item name and its restaurant / meat centre" },
  { key: "clicks", label: "Clicks", hint: "Taps on the item in a menu or in search results", numeric: true },
  { key: "cartAdds", label: "Added to cart", hint: "Units added to a cart", numeric: true },
  { key: "cartRemoves", label: "Removed", hint: "Units taken back out of a cart", numeric: true },
  { key: "quantity", label: "Units ordered", hint: "Units in placed orders (cancelled excluded)", numeric: true },
  { key: "orders", label: "Orders", hint: "Orders that included the item", numeric: true },
  { key: "revenue", label: "Revenue", hint: "Units × price at the time of the order", numeric: true },
  { key: "conversion", label: "Conversion", hint: "Orders per 100 clicks", numeric: true },
];

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function toCsv(rows: ItemStatRow[]) {
  const header = ["Item", "Restaurant", "Type", "Category", "Price", "On menu", "Clicks", "Added to cart", "Removed", "Units ordered", "Orders", "Revenue", "Conversion %"];
  const cell = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = rows.map((r) =>
    [r.name, r.vendorName, r.type, r.category, r.price, r.onMenu ? "yes" : "no", r.clicks, r.cartAdds, r.cartRemoves, r.quantity, r.orders, r.revenue, r.conversion]
      .map(cell)
      .join(","),
  );
  return [header.join(","), ...body].join("\n");
}

/**
 * Every food and meat item with how often it was tapped, added to a cart and
 * ordered. Taps come from the customer app's events; units, orders and revenue
 * come from real orders, so cash and online orders both count.
 */
export default function ItemInsights() {
  const {
    days, setDays, vendorId, setVendorId, searchInput, setSearchInput,
    sort, order, toggleSort, page, setPage, pageSize, stats, fetchAll,
  } = useItemStats();
  const [exporting, setExporting] = useState(false);
  const data = stats.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all = await fetchAll();
      const blob = new Blob([toCsv(all.items)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `item-insights-last-${days}-days.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(`Export failed: ${(err as Error).message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardLayout searchPlaceholder="Search items...">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Item Insights</h1>
            <p className="text-sm text-muted-foreground">
              Every food and meat item: how often it is clicked, added to a cart and ordered
            </p>
          </div>
          <Button variant="outline" onClick={exportCsv} disabled={exporting || !data?.total}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={<UtensilsCrossed className="h-5 w-5" />} label="Items" value={(data?.totals.items ?? 0).toLocaleString()} subtitle={`last ${days} days`} badgeColor="muted" />
          <StatCard icon={<MousePointerClick className="h-5 w-5" />} label="Clicks" value={(data?.totals.clicks ?? 0).toLocaleString()} badgeColor="muted" />
          <StatCard icon={<ShoppingCart className="h-5 w-5" />} label="Added to cart" value={(data?.totals.cartAdds ?? 0).toLocaleString()} badgeColor="muted" />
          <StatCard icon={<Package className="h-5 w-5" />} label="Units ordered" value={(data?.totals.quantity ?? 0).toLocaleString()} badgeColor="muted" />
          <StatCard icon={<IndianRupee className="h-5 w-5" />} label="Revenue" value={rupees(data?.totals.revenue ?? 0)} badgeColor="muted" />
        </div>

        <div className="section-card p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search item or restaurant…"
              className="pl-9"
            />
          </div>
          <Select value={vendorId || ALL_OUTLETS} onValueChange={(v) => setVendorId(v === ALL_OUTLETS ? "" : v)}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="All restaurants" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_OUTLETS}>All restaurants</SelectItem>
              {(data?.outlets ?? []).map((o) => (
                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ITEM_PERIOD_OPTIONS.map((d) => (
                <SelectItem key={d} value={String(d)}>{d === 365 ? "Last 12 months" : `Last ${d} days`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {stats.isError && (
          <div className="section-card p-4 text-sm text-destructive">
            Could not load items: {(stats.error as Error)?.message}
          </div>
        )}

        <div className="section-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                {COLUMNS.map((c) => (
                  <TableHead key={c.key} className={c.numeric ? "text-right" : undefined} title={c.hint}>
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className={`inline-flex items-center gap-1 font-medium hover:text-foreground ${sort === c.key ? "text-foreground" : ""}`}
                    >
                      {c.label}
                      {sort === c.key && (order === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />)}
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.isLoading ? (
                <TableRow><TableCell colSpan={COLUMNS.length + 1} className="text-center text-muted-foreground py-10">Loading…</TableCell></TableRow>
              ) : !data || data.items.length === 0 ? (
                <TableRow><TableCell colSpan={COLUMNS.length + 1} className="text-center text-muted-foreground py-10">No items match these filters.</TableCell></TableRow>
              ) : (
                data.items.map((r, i) => (
                  <TableRow key={`${r.itemId}-${r.vendorId ?? ""}`}>
                    <TableCell className="text-muted-foreground tabular-nums">{(page - 1) * pageSize + i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {r.isVeg !== undefined && (
                          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${r.isVeg ? "bg-green-600" : "bg-red-600"}`} title={r.isVeg ? "Veg" : "Non-veg"} />
                        )}
                        <span className="font-medium text-foreground">{r.name}</span>
                        {r.type === "meat" && <Badge variant="secondary">Meat</Badge>}
                        {!r.onMenu && <Badge variant="outline">Not on menu</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.vendorName ?? "Unknown restaurant"}
                        {r.category ? ` · ${r.category}` : ""}
                        {r.price !== undefined ? ` · ${rupees(r.price)}` : ""}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.clicks.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.cartAdds.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.cartRemoves.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">{r.quantity.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.orders.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{rupees(r.revenue)}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.conversion === null ? "–" : `${r.conversion}%`}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {data && data.total > pageSize && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {((page - 1) * pageSize + 1).toLocaleString()}–{Math.min(page * pageSize, data.total).toLocaleString()} of {data.total.toLocaleString()} items
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span>Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Clicks and cart numbers come from the customer app (kept 90 days) and only exist for app versions with item tracking.
          Units, orders and revenue come from placed orders. Conversion is orders per 100 clicks; it can pass 100% when people reorder without opening the item.
        </p>
      </div>
    </DashboardLayout>
  );
}
