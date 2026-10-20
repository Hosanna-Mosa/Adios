import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";

export interface AuditEntry {
  _id: string;
  actorId: string;
  actorName?: string;
  actorRole: string;
  action: string;
  method: string;
  path: string;
  targetType?: string;
  targetId?: string;
  before?: unknown;
  after?: unknown;
  request?: unknown;
  statusCode: number;
  ip?: string;
  createdAt: string;
}

export interface AuditFilters {
  actor: string;
  action: string;
  targetType: string;
  from: string;
  to: string;
}

const EMPTY: AuditFilters = { actor: "", action: "", targetType: "", from: "", to: "" };

/** The audit trail (GET /admin/audit-logs): filters and paging. The trail is read-only. */
export function useAuditLog() {
  const [filters, setFilters] = useState<AuditFilters>(EMPTY);
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({ page: String(page), limit: "25" });
  (Object.keys(filters) as (keyof AuditFilters)[]).forEach((key) => {
    const value = filters[key].trim();
    if (!value) return;
    // The date pickers give a day; "to" runs to the end of that day.
    params.set(key, key === "to" ? `${value}T23:59:59.999` : value);
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin", "audit-logs", params.toString()],
    queryFn: () => adminFetch<{ items: AuditEntry[]; total: number; page: number; pages: number }>(`/admin/audit-logs?${params.toString()}`),
    placeholderData: keepPreviousData,
  });

  return {
    filters,
    setFilter: (key: keyof AuditFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    reset: () => {
      setFilters(EMPTY);
      setPage(1);
    },
    page,
    setPage,
    entries: data?.items ?? [],
    total: data?.total ?? 0,
    pages: data?.pages ?? 1,
    isLoading,
    isFetching,
  };
}
