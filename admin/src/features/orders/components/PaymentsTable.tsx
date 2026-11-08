import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { SlidersHorizontal, Download, Eye, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Transaction } from "../paymentsTypes";
import { adminOrderStatusLabel } from "@/components/shared/adminOrderStatus";

interface PaymentsTableProps {
  isLoading: boolean;
  /** The current page of rows. */
  pageTxns: Transaction[];
  /** Rows matching the status filter, across all pages. */
  filteredCount: number;
  /** Every row the API returned, before filtering. */
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  onViewTxn: (txn: Transaction) => void;
  onExportCsv: () => void;
}

const HEAD = "table-header-text text-left px-6 py-3";
const HEAD_RIGHT = "table-header-text text-right px-6 py-3";

function buildColumns(onViewTxn: (txn: Transaction) => void, t: (key: string, opts?: Record<string, unknown>) => string): DataTableColumn<Transaction>[] {
  return [
    {
      key: "id",
      header: t("orders.transactionId"),
      headerClassName: HEAD,
      cellClassName: "px-6 py-3.5 align-middle whitespace-nowrap",
      cell: (txn) => <span className="font-mono text-[13px] font-semibold text-primary">{txn.id}</span>,
    },
    {
      key: "date",
      header: t("orders.dateAndTime"),
      headerClassName: HEAD,
      cellClassName: "px-6 py-3.5 align-middle whitespace-nowrap",
      cell: (txn) => (
        <>
          <p className="text-sm font-medium text-foreground">{txn.date}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{txn.time}</p>
        </>
      ),
    },
    {
      key: "route",
      header: t("orders.routeDetails"),
      headerClassName: HEAD,
      cellClassName: "px-6 py-3.5 align-middle w-full min-w-[180px]",
      cell: (txn) => (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Truck className="h-4 w-4" />
          </span>
          <span className="text-sm text-foreground">{txn.route}</span>
        </div>
      ),
    },
    {
      key: "fee",
      header: t("orders.deliveryFee"),
      headerClassName: HEAD_RIGHT,
      cellClassName: "px-6 py-3.5 align-middle text-right whitespace-nowrap",
      cell: (txn) => <span className="text-sm font-semibold tabular-nums text-foreground">{txn.fee}</span>,
    },
    {
      key: "status",
      header: t("users.status"),
      headerClassName: HEAD,
      cellClassName: "px-6 py-3.5 align-middle whitespace-nowrap",
      cell: (txn) => <StatusBadge status={adminOrderStatusLabel(txn.status, t)} variant={txn.statusVariant} />,
    },
    {
      key: "action",
      header: t("orders.action"),
      headerClassName: HEAD_RIGHT,
      cellClassName: "px-6 py-3.5 align-middle text-right whitespace-nowrap",
      cell: (txn) => (
        <button
          onClick={() => onViewTxn(txn)}
          aria-label={t("orders.viewTransaction", { id: txn.id, defaultValue: "View transaction {{id}}" })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          <Eye className="h-3.5 w-3.5" />
          {t("orders.view", { defaultValue: "View" })}
        </button>
      ),
    },
  ];
}

const STATUS_FILTER_LABEL_KEY: Record<string, string> = {
  ALL: "dashboard.allStatuses",
  SETTLED: "orders.settled",
  PENDING: "orders.pending",
};

/** The "Recent Delivery Fees" table (filter/export header, rows, pagination) on Payments. */
export function PaymentsTable({
  isLoading,
  pageTxns,
  filteredCount,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  statusFilter,
  setStatusFilter,
  onViewTxn,
  onExportCsv,
}: PaymentsTableProps) {
  const { t } = useTranslation();
  return (
    <div className="section-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{t("orders.recentDeliveryFees")}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("orders.showingTransactions", {
              shown: filteredCount,
              total: totalCount,
              defaultValue: "{{shown}} of {{total}} transactions",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/50">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" /> {t("common.filterColon", { value: STATUS_FILTER_LABEL_KEY[statusFilter] ? t(STATUS_FILTER_LABEL_KEY[statusFilter]) : statusFilter, defaultValue: "Filter: {{value}}" })}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("ALL")} className="cursor-pointer">{t("orders.allTransactions")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("SETTLED")} className="cursor-pointer">{t("orders.settled")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("PENDING")} className="cursor-pointer">{t("orders.pending")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={onExportCsv}
            className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Download className="h-4 w-4" /> {t("orders.exportCsv")}
          </button>
        </div>
      </div>

      <DataTable
        columns={buildColumns(onViewTxn, t)}
        data={pageTxns}
        rowKey={(txn) => txn.id}
        theadClassName="bg-muted/40"
        headerRowClassName="border-y border-border"
        tbodyClassName="divide-y divide-border"
        rowClassName="transition-colors hover:bg-muted/30"
        isLoading={isLoading}
        loadingLabel={t("orders.loadingPayments")}
        emptyLabel={totalCount === 0 ? t("orders.noTransactionsYet") : t("orders.noTransactionsFoundMatchingFilter")}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemLabel={t("orders.transactionsLower")}
        shownCount={pageTxns.length}
        totalCount={filteredCount}
      />
    </div>
  );
}
