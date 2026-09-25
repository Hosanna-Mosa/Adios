import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api-client";
import type { RefundRow } from "../moneyTypes";

export type RefundFilter = "attention" | "pending" | "processed" | "ALL";

/** Data and actions for Refunds.tsx. Refunds run automatically through Razorpay; this handles the exceptions. */
export function useRefunds() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<RefundFilter>("attention");
  const [markingManual, setMarkingManual] = useState<RefundRow | null>(null);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  const { data: refunds = [], isLoading } = useQuery({
    queryKey: ["admin", "refunds"],
    queryFn: () => adminFetch<RefundRow[]>("/admin/refunds"),
    refetchInterval: 60000,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "refunds"] });

  const orderAction = useMutation({
    mutationFn: ({ row, action }: { row: RefundRow; action: "retry" | "refresh" }) => {
      setBusyOrderId(row.orderId);
      return adminFetch(`/admin/refunds/${row.orderId}/${action}`, { method: "POST" });
    },
    onSuccess: (_d, { action }) => {
      toast.success(action === "retry" ? "Refund sent to Razorpay again." : "Status updated from Razorpay.");
      refresh();
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't update the refund"),
    onSettled: () => setBusyOrderId(null),
  });

  const markRefunded = useMutation({
    mutationFn: ({ row, reference, note }: { row: RefundRow; reference: string; note?: string }) =>
      adminFetch(`/admin/refunds/${row.orderId}/mark-refunded`, {
        method: "POST",
        body: JSON.stringify(note ? { reference, note } : { reference }),
      }),
    onSuccess: (_d, { row }) => {
      toast.success(`Recorded the ₹${row.amount} refund to ${row.customerName}. They've been notified.`);
      setMarkingManual(null);
      refresh();
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't record the refund"),
  });

  const needsAttention = refunds.filter((r) => r.status === "due" || r.status === "failed");
  const filtered =
    filter === "ALL" ? refunds
    : filter === "attention" ? needsAttention
    : refunds.filter((r) => r.status === filter);

  return {
    refunds, filtered, isLoading, filter, setFilter,
    markingManual, setMarkingManual, markRefunded,
    retry: (row: RefundRow) => orderAction.mutate({ row, action: "retry" }),
    checkStatus: (row: RefundRow) => orderAction.mutate({ row, action: "refresh" }),
    busyOrderId: orderAction.isPending ? busyOrderId : null,
    attentionCount: needsAttention.length,
    pendingCount: refunds.filter((r) => r.status === "pending").length,
    refundedCount: refunds.filter((r) => r.status === "processed").length,
  };
}
