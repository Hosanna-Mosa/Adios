import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, ExternalLink, Link2, Package, Unlink } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { adminOrderStatusLabel } from "@/components/shared/adminOrderStatus";
import { useLinkTicketOrder, useSupportOrder, useSupportOrderSearch } from "../../hooks/useSupportOrders";
import { formatDateTime, orderStatusVariant, rupees, ticketOwnerFilter } from "../../supportOrderTypes";
import type { Ticket } from "../../types";
import { SupportOrderDetails } from "./SupportOrderDetails";

/**
 * The order side of a support case, above the chat. With a linked order it shows that
 * order (collapsed to one line until opened); without one, the person's / outlet's
 * recent orders so the agent can link the right one. Linking changes the ticket only.
 */
export function SupportTicketOrderPanel({ ticket }: { ticket: Ticket }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const link = useLinkTicketOrder(ticket._id);
  const ownerFilter = ticketOwnerFilter(ticket);

  const { data: order, isError: orderMissing } = useSupportOrder(ticket.orderId);
  const recent = useSupportOrderSearch({ ...(ownerFilter ?? {}), limit: 5 }, open && !ticket.orderId && !!ownerFilter);

  const setLinked = (orderId: string | null) =>
    link.mutate(orderId, {
      onSuccess: () => toast.success(orderId ? t("supportOrders.linked") : t("supportOrders.unlinked")),
      onError: (err: Error) => toast.error(err.message),
    });

  if (!ticket.orderId && !ownerFilter) return null;

  return (
    <div className="mx-4 mt-3 rounded-xl border border-border bg-card text-xs">
      <div className="flex items-center gap-2 p-3">
        <button onClick={() => setOpen((v) => !v)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
          <Package className="h-3.5 w-3.5 shrink-0 text-primary" />
          {ticket.orderId ? (
            <span className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground">#{ticket.orderId}</span>
              {order && (
                <>
                  <StatusBadge status={adminOrderStatusLabel(order.status, t)} variant={orderStatusVariant(order.status)} />
                  <span className="text-muted-foreground">{rupees(order.pricing.total)}</span>
                </>
              )}
              {orderMissing && <span className="text-destructive">{t("orders.orderNotFound")}</span>}
            </span>
          ) : (
            <span className="font-semibold text-foreground">{t("supportOrders.recentOrdersOf", { name: ticket.user })}</span>
          )}
        </button>
        {ticket.orderId && (
          <>
            <Link to={`/support/orders/${encodeURIComponent(ticket.orderId)}`} className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 font-semibold hover:bg-muted" title={t("supportOrders.openFullOrder")}>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <button onClick={() => setLinked(null)} disabled={link.isPending} className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-muted-foreground hover:bg-muted disabled:opacity-50" title={t("supportOrders.unlink")}>
              <Unlink className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {open && ticket.orderId && order && (
        <div className="max-h-[45vh] overflow-y-auto border-t border-border p-3">
          <SupportOrderDetails order={order} />
        </div>
      )}

      {open && !ticket.orderId && (
        <div className="border-t border-border">
          {recent.isLoading ? (
            <p className="p-3 text-muted-foreground">{t("supportOrders.loading")}</p>
          ) : !recent.data?.orders.length ? (
            <p className="p-3 italic text-muted-foreground">{t("supportOrders.noOrders")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.data.orders.map((o) => (
                <li key={o._id} className="flex items-center gap-2 p-3">
                  <Link to={`/support/orders/${encodeURIComponent(o._id)}`} className="font-semibold text-primary hover:underline">#{o._id}</Link>
                  <StatusBadge status={adminOrderStatusLabel(o.status, t)} variant={orderStatusVariant(o.status)} />
                  <span className="text-muted-foreground">{rupees(o.total)} · {formatDateTime(o.createdAt)}</span>
                  <button onClick={() => setLinked(o._id)} disabled={link.isPending} className="ml-auto flex items-center gap-1 rounded-lg border border-border px-2 py-1 font-semibold hover:bg-muted disabled:opacity-50">
                    <Link2 className="h-3.5 w-3.5" /> {t("supportOrders.linkToTicket")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
