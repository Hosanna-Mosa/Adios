import { CheckCircle2, Clock, Hourglass, XCircle } from "lucide-react";

export type ScheduledRequest = {
  requestId: string;
  vendorId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  scheduledFor: string;
  status: "pending" | "accepted" | "rejected";
  respondedAt?: string;
  createdAt: string;
};

const STATUS_STYLE_META: Record<ScheduledRequest["status"], { className: string; icon: typeof Clock }> = {
  pending: {
    className: "bg-amber-500/10 text-amber-700 border-amber-200",
    icon: Hourglass,
  },
  accepted: {
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  rejected: {
    className: "bg-rose-500/10 text-rose-700 border-rose-200",
    icon: XCircle,
  },
};

/** Translated display label + style for a scheduled-request status — the
 * status value itself (used for state and the backend payload) is never
 * translated, only what's shown via this helper. */
export function getStatusStyle(status: ScheduledRequest["status"], t: (key: string) => string) {
  const labelKey: Record<ScheduledRequest["status"], string> = {
    pending: "vendorScheduledOrders.statusPending",
    accepted: "vendorScheduledOrders.statusAccepted",
    rejected: "vendorScheduledOrders.statusRejected",
  };
  return { label: t(labelKey[status]), ...STATUS_STYLE_META[status] };
}
