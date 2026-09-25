import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { SlidersHorizontal, Download, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
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
  filteredTxns: Transaction[];
  totalCount: number;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  onViewTxn: (txn: Transaction) => void;
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

/** The "Recent Delivery Fees" table (filter/export header, rows, pagination) on Payments. */
const STATUS_FILTER_LABEL_KEY: Record<string, string> = {
  ALL: "dashboard.allStatuses",
  SETTLED: "orders.settled",
  PENDING: "orders.pending",
};

export function PaymentsTable({ isLoading, filteredTxns, totalCount, statusFilter, setStatusFilter, onViewTxn }: PaymentsTableProps) {
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
            onClick={() => toast.success(t("orders.csvStatementDownloaded"))}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Download className="h-4 w-4" /> {t("orders.exportCsv")}
          </button>
        </div>
      </div>

      <DataTable
        columns={buildColumns(onViewTxn, t)}
        data={filteredTxns}
        rowKey={(txn) => txn.id}
        isLoading={isLoading}
        loadingLabel={t("orders.loadingPayments")}
        emptyLabel={t("orders.noTransactionsFoundMatchingFilter")}
      />

      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
        <p className="text-sm text-muted-foreground">{t("orders.showingXOfYTransactions", { shown: totalCount, total: 285, defaultValue: "Showing {{shown}} of {{total}} transactions" })}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => toast.info(t("orders.noPreviousPages"))} className="p-1.5 border border-border rounded text-muted-foreground hover:bg-muted/50 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
          <button className="h-8 w-8 rounded bg-primary text-primary-foreground text-sm font-medium">1</button>
          <button onClick={() => toast.info(t("orders.pageNNotSimulated", { n: 2, defaultValue: "Page {{n}} not simulated" }))} className="h-8 w-8 rounded text-sm text-muted-foreground hover:bg-muted/50 transition-colors">2</button>
          <button onClick={() => toast.info(t("orders.pageNNotSimulated", { n: 3, defaultValue: "Page {{n}} not simulated" }))} className="h-8 w-8 rounded text-sm text-muted-foreground hover:bg-muted/50 transition-colors">3</button>
          <button onClick={() => toast.info(t("orders.noNextPages"))} className="p-1.5 border border-border rounded text-muted-foreground hover:bg-muted/50 transition-colors"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
