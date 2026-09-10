import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import type { Transaction } from "../paymentsTypes";

/** All state/query/derived-stats logic for Payments.tsx (work queue item #18). */
export function usePayments() {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: () => adminFetch<Transaction[]>("/admin/payments"),
  });

  const handleViewTxn = (txn: Transaction) => {
    setSelectedTxn(txn);
    setIsViewOpen(true);
  };

  // Derive dynamic stats from transactions
  const totalEarned = transactions.reduce((acc, t) => {
    const numericFee = parseFloat(t.fee.replace("₹", "")) || 0;
    return acc + numericFee;
  }, 0);

  const filteredTxns = transactions.filter((t) => {
    if (statusFilter === "ALL") return true;
    return t.status === statusFilter;
  });

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
    filteredTxns,
  };
}
