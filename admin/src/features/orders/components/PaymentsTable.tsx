import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { SlidersHorizontal, Download, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Transaction } from "../paymentsTypes";

interface PaymentsTableProps {
  isLoading: boolean;
  filteredTxns: Transaction[];
  totalCount: number;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  onViewTxn: (txn: Transaction) => void;
}

function buildColumns(onViewTxn: (txn: Transaction) => void): DataTableColumn<Transaction>[] {
  return [
    {
      key: "id",
      header: "Transaction ID",
      cellClassName: "px-6 py-4 text-sm font-medium text-primary",
      cell: (t) => t.id,
    },
    {
      key: "date",
      header: "Date & Time",
      cell: (t) => (
        <>
          <p className="text-sm text-foreground">{t.date}</p>
          <p className="text-xs text-muted-foreground">{t.time}</p>
        </>
      ),
    },
    {
      key: "route",
      header: "Route Details",
      cellClassName: "px-6 py-4 text-sm text-foreground",
      cell: (t) => t.route,
    },
    {
      key: "fee",
      header: "Delivery Fee",
      cellClassName: "px-6 py-4 text-sm font-semibold text-foreground",
      cell: (t) => t.fee,
    },
    {
      key: "status",
      header: "Status",
      cell: (t) => <StatusBadge status={t.status} variant={t.statusVariant} />,
    },
    {
      key: "action",
      header: "Action",
      cell: (t) => (
        <button
          onClick={() => onViewTxn(t)}
          className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];
}

/** The "Recent Delivery Fees" table (filter/export header, rows, pagination) on Payments. */
export function PaymentsTable({ isLoading, filteredTxns, totalCount, statusFilter, setStatusFilter, onViewTxn }: PaymentsTableProps) {
  return (
    <div className="section-card">
      <div className="flex items-center justify-between p-6 pb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Delivery Fees</h3>
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
                <SlidersHorizontal className="h-4 w-4" /> Filter: {statusFilter}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("ALL")} className="cursor-pointer">All Transactions</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("SETTLED")} className="cursor-pointer">Settled</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("PENDING")} className="cursor-pointer">Pending</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={() => toast.success("CSV Statement compiled and downloaded!")}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <DataTable
        columns={buildColumns(onViewTxn)}
        data={filteredTxns}
        rowKey={(t) => t.id}
        isLoading={isLoading}
        loadingLabel="Loading payments..."
        emptyLabel="No transactions found matching the filter."
      />

      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
        <p className="text-sm text-muted-foreground">Showing {totalCount} of 285 transactions</p>
        <div className="flex items-center gap-1">
          <button onClick={() => toast.info("No previous pages")} className="p-1.5 border border-border rounded text-muted-foreground hover:bg-muted/50 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
          <button className="h-8 w-8 rounded bg-primary text-primary-foreground text-sm font-medium">1</button>
          <button onClick={() => toast.info("Page 2 not simulated")} className="h-8 w-8 rounded text-sm text-muted-foreground hover:bg-muted/50 transition-colors">2</button>
          <button onClick={() => toast.info("Page 3 not simulated")} className="h-8 w-8 rounded text-sm text-muted-foreground hover:bg-muted/50 transition-colors">3</button>
          <button onClick={() => toast.info("No next pages")} className="p-1.5 border border-border rounded text-muted-foreground hover:bg-muted/50 transition-colors"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
