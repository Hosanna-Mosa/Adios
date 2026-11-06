import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import type { ItemSortKey, ItemStats } from "../types";

export const ITEM_PERIOD_OPTIONS = [7, 30, 90, 365] as const;
const PAGE_SIZE = 50;

function buildQuery(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") q.set(k, String(v));
  return q.toString();
}

/** Item Insights page: every item's taps, cart adds, orders and revenue, filterable and sortable. */
export function useItemStats() {
  const [days, setDays] = useState<number>(30);
  const [vendorId, setVendorId] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ItemSortKey>("quantity");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  // Typing shouldn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Any filter change starts again from the first page.
  useEffect(() => setPage(1), [days, vendorId, search, sort, order]);

  const filters = { days, vendorId: vendorId || undefined, search: search || undefined, sort, order };

  const stats = useQuery({
    queryKey: ["analytics", "items", filters, page],
    queryFn: () => adminFetch<ItemStats>(`/analytics/items?${buildQuery({ ...filters, page, limit: PAGE_SIZE })}`),
    placeholderData: keepPreviousData,
  });

  /** Clicking the active column flips the direction; a new column starts high-to-low (names A-Z). */
  const toggleSort = (key: ItemSortKey) => {
    if (key === sort) setOrder(order === "desc" ? "asc" : "desc");
    else {
      setSort(key);
      setOrder(key === "name" ? "asc" : "desc");
    }
  };

  /** Every row matching the current filters (not just this page), for CSV export. */
  const fetchAll = () => adminFetch<ItemStats>(`/analytics/items?${buildQuery({ ...filters, page: 1, limit: 2000 })}`);

  return {
    days, setDays, vendorId, setVendorId, searchInput, setSearchInput,
    sort, order, toggleSort, page, setPage, pageSize: PAGE_SIZE, stats, fetchAll,
  };
}
