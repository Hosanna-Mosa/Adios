import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import type { PayoutRow } from "@/features/money/moneyTypes";
import type { Transaction } from "../paymentsTypes";

const ITEMS_PER_PAGE = 10;

/** The API serves fees as display strings ("₹150"); this reads the number back out. */
const parseFee = (fee: string | number | undefined) => {
  const value = parseFloat(String(fee ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(value) ? value : 0;
};

const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

/** All state/query/derived-stats logic for Payments.tsx (work queue item #18). */
export function usePayments() {
  const { t } = useTranslation();
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [statusFilter, setStatusFilterState] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: () => adminFetch<Transaction[]>("/admin/payments"),
  });

  // Driver cash-outs, for the real "Driver Payouts" figure (it used to be a fixed
  // 65% of total earnings). Same query key as the Payouts page, so they share a cache.
  const { data: payouts = [] } = useQuery({
    queryKey: ["admin", "payouts"],
    queryFn: () => adminFetch<PayoutRow[]>("/admin/payouts"),
  });

  const handleViewTxn = (txn: Transaction) => {
    setSelectedTxn(txn);
    setIsViewOpen(true);
  };

  const setStatusFilter = (value: string) => {
    setStatusFilterState(value);
    setCurrentPage(1);
  };

  // Derive dynamic stats from transactions
  const totalEarned = transactions.reduce((acc, txn) => acc + parseFee(txn.fee), 0);

  const paidDriverPayouts = payouts.filter((p) => p.kind === "driver" && p.status === "processed");
  const driverPayoutsTotal = paidDriverPayouts.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const filteredTxns = transactions.filter((txn) => {
    if (statusFilter === "ALL") return true;
    return txn.status === statusFilter;
  });

  // Real client-side pagination over the fetched rows (the old pager was three
  // fixed buttons that toasted "Page N not simulated").
  const totalPages = Math.ceil(filteredTxns.length / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTxns = filteredTxns.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  // Downloads the rows matching the current filter. "Export CSV" used to show a
  // success toast without producing a file.
  const handleExportCsv = () => {
    if (filteredTxns.length === 0) {
      toast.error(t("downloadReport.noDataAvailableToExport"));
      return;
    }
    const header = [t("orders.transactionId"), t("orders.dateAndTime"), t("orders.routeDetails"), t("orders.deliveryFee"), t("users.status")];
    const rows = filteredTxns.map((txn) => [txn.id, `${txn.date} ${txn.time}`, txn.route, parseFee(txn.fee), txn.status]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(t("orders.csvStatementDownloaded"));
  };

  return {
    transactions,
    isLoading,
    selectedTxn,
    isViewOpen,
    setIsViewOpen,
    statusFilter,
    setStatusFilter,
    handleViewTxn,
    totalEarned,
    driverPayoutsTotal,
    paidDriverPayoutsCount: paidDriverPayouts.length,
    filteredTxns,
    paginatedTxns,
    currentPage: safePage,
    setCurrentPage,
    totalPages,
    handleExportCsv,
  };
}
