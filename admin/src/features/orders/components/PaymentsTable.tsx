import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { SlidersHorizontal, Download, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Transaction } from "../paymentsTypes";
import { adminOrderStatusLabel } from "../adminOrderStatus";

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

function buildColumns(onViewTxn: (txn: Transaction) => void, t: (key: string, opts?: Record<string, unknown>) => string): DataTableColumn<Transaction>[] {
  return [
    {
      key: "id",
      header: t("orders.transactionId"),
      cellClassName: "px-6 py-4 text-sm font-medium text-primary",
      cell: (txn) => txn.id,
    },
    {
      key: "date",
      header: t("orders.dateAndTime"),
      cell: (txn) => (
        <>
          <p className="text-sm text-foreground">{txn.date}</p>
          <p className="text-xs text-muted-foreground">{txn.time}</p>
        </>
      ),
    },
    {
      key: "route",
      header: t("orders.routeDetails"),
      cellClassName: "px-6 py-4 text-sm text-foreground",
      cell: (txn) => txn.route,
    },
    {
      key: "fee",
      header: t("orders.deliveryFee"),
      cellClassName: "px-6 py-4 text-sm font-semibold text-foreground",
      cell: (txn) => txn.fee,
    },
    {
      key: "status",
      header: t("users.status"),
      cell: (txn) => <StatusBadge status={adminOrderStatusLabel(txn.status, t)} variant={txn.statusVariant} />,
    },
    {
      key: "action",
      header: t("orders.action"),
      cell: (txn) => (
        <button
          onClick={() => onViewTxn(txn)}
          className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Eye className="h-4 w-4" />
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
    <div className="section-card">
      <div className="flex items-center justify-between p-6 pb-4">
        <h3 className="text-lg font-semibold text-foreground">{t("orders.recentDeliveryFees")}</h3>
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
                <SlidersHorizontal className="h-4 w-4" /> {t("common.filterColon", { value: STATUS_FILTER_LABEL_KEY[statusFilter] ? t(STATUS_FILTER_LABEL_KEY[statusFilter]) : statusFilter, defaultValue: "Filter: {{value}}" })}
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
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Download className="h-4 w-4" /> {t("orders.exportCsv")}
          </button>
        </div>
      </div>

      <DataTable
        columns={buildColumns(onViewTxn, t)}
        data={pageTxns}
        rowKey={(txn) => txn.id}
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
