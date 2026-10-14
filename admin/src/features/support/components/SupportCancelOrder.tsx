import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Ban } from "lucide-react";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { appConfirm } from "@/lib/dialog";

const FINISHED = ["DELIVERED", "DELIVERED_LC", "COMPLETED", "CANCELLED"];

/** Lets a support agent cancel the order a ticket is about (PATCH /orders/:id/status). */
export function SupportCancelOrder({ orderId }: { orderId: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const queryKey = ["support-order", orderId];

  const { data: order } = useQuery({
    queryKey,
    queryFn: () => adminFetch<{ status: string }>(`/orders/${orderId}`),
  });

  const cancel = useMutation({
    mutationFn: () => adminFetch(`/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status: "CANCELLED" }) }),
    onSuccess: () => {
      toast.success(t("support.orderCancelled", { defaultValue: "Order cancelled" }));
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: Error) => toast.error(err.message || t("support.orderCancelFailed", { defaultValue: "Couldn't cancel the order" })),
  });

  if (!order) return null;
  const status = String(order.status).toUpperCase();
  const finished = FINISHED.includes(status);

  const onClick = async () => {
    const ok = await appConfirm({
      title: t("support.confirmCancelOrder", { id: orderId, defaultValue: "Cancel order #{{id}}? The customer will be told the Adios team cancelled it." }),
      tone: "destructive",
    });
    if (ok) cancel.mutate();
  };

  return (
    <div className="mx-4 mt-3 flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs">
      <span>
        <span className="text-muted-foreground">{t("support.botOrder")}:</span> #{orderId} · {status}
      </span>
      {!finished && (
        <button onClick={onClick} disabled={cancel.isPending} className="flex items-center gap-1.5 rounded-lg border border-destructive/30 px-2.5 py-1.5 font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50">
          <Ban className="h-3.5 w-3.5" /> {t("support.cancelOrder", { defaultValue: "Cancel order" })}
        </button>
      )}
    </div>
  );
}
