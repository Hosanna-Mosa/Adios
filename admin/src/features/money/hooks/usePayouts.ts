import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api-client";
import type { PayoutRow, PayoutStatus } from "../moneyTypes";

export type PayoutFilter = "pending" | "processed" | "failed" | "ALL";

/** Data and actions for Payouts.tsx: driver/vendor cash-out requests paid by hand. */
export function usePayouts() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<PayoutFilter>("pending");
  const [paying, setPaying] = useState<PayoutRow | null>(null);
  const [rejecting, setRejecting] = useState<PayoutRow | null>(null);

  const { data: payouts = [], isLoading } = useQuery({
    queryKey: ["admin", "payouts"],
    queryFn: () => adminFetch<PayoutRow[]>("/admin/payouts"),
    refetchInterval: 30000,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "payouts"] });

  const markPaid = useMutation({
    mutationFn: ({ row, reference, note }: { row: PayoutRow; reference: string; note?: string }) =>
      adminFetch(`/admin/payouts/${row.kind}/${row.id}/mark-paid`, {
        method: "POST",
        body: JSON.stringify(note ? { reference, note } : { reference }),
      }),
    onSuccess: (_d, { row }) => {
      toast.success(`Marked ₹${row.amount} to ${row.name} as paid. They've been notified.`);
      setPaying(null);
      refresh();
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't mark the payout as paid"),
  });

  const reject = useMutation({
    mutationFn: ({ row, reason }: { row: PayoutRow; reason: string }) =>
      adminFetch(`/admin/payouts/${row.kind}/${row.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: (_d, { row }) => {
      toast.success(`Payout rejected. ₹${row.amount} is back in ${row.name}'s balance.`);
      setRejecting(null);
      refresh();
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't reject the payout"),
  });

  const count = (status: PayoutStatus) => payouts.filter((p) => p.status === status).length;
  const toPay = payouts.filter((p) => p.status === "pending");
  const toPayTotal = toPay.reduce((sum, p) => sum + (p.amount || 0), 0);

  const filtered = filter === "ALL" ? payouts : payouts.filter((p) => p.status === filter);

  return {
    payouts, filtered, isLoading, filter, setFilter,
    paying, setPaying, rejecting, setRejecting,
    markPaid, reject,
    toPayCount: toPay.length, toPayTotal, paidCount: count("processed"), rejectedCount: count("failed"),
  };
}
