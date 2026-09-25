import { format } from "date-fns";
import { CheckCircle2, Hourglass, XCircle } from "lucide-react";

export type ScheduleStatus = "pending" | "accepted" | "rejected";

export interface ScheduledOrder {
  _id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  scheduledFor: string;
  scheduleStatus?: ScheduleStatus | null;
  scheduleRejectionReason?: string | null;
  user?: { _id: string; name?: string; phone?: string; email?: string } | null;
  vendor?: { _id: string; name?: string; phone?: string; address?: string } | null;
  items?: { id: string; name: string; quantity: number; price: number }[];
}

const STATUS_STYLE_META: Record<ScheduleStatus, { className: string; icon: typeof Hourglass }> = {
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

export function getStatusStyle(status: ScheduleStatus, t: (key: string) => string) {
  const labelKey: Record<ScheduleStatus, string> = {
    pending: "orders.statusPending",
    accepted: "orders.statusAccepted",
    rejected: "orders.statusRejected",
  };
  return { label: t(labelKey[status]), ...STATUS_STYLE_META[status] };
}

// Orders created before a verdict exists carry a null scheduleStatus — they are still awaiting one.
export const scheduleStatusOf = (order: ScheduledOrder): ScheduleStatus => order.scheduleStatus || "pending";

// The boot seeder writes literal ORD-#### ids; real orders use a generated string id.
export const orderLabel = (id: string) => {
  const value = String(id || "");
  return value.startsWith("ORD-") ? value : `#${value.slice(-6)}`;
};

// date-fns throws on an invalid date, which would take the whole table down, so every
// timestamp coming off the API is validated before it is formatted.
export const formatDate = (value: string | undefined, pattern: string) => {
  const date = new Date(value || "");
  return Number.isNaN(date.getTime()) ? "—" : format(date, pattern);
};

export const formatSlot = (value: string) => formatDate(value, "EEE, MMM d · hh:mm a");
