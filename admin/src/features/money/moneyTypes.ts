import { format } from "date-fns";
import { AlertTriangle, CheckCircle2, Hourglass, Loader2, XCircle } from "lucide-react";

// Rows served by GET /admin/refunds and GET /admin/payouts (backend: payments/admin.money.service.ts).

export type RefundStatus = "due" | "pending" | "processed" | "failed";

export interface RefundRow {
  orderId: string;
  serviceType: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  status: RefundStatus;
  method?: "razorpay" | "manual";
  razorpayRefundId?: string;
  reference?: string;
  refundedBy?: string;
  failureReason?: string;
  requestedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

/** Backend statuses: pending = requested (not yet paid), processing = with RazorpayX. */
export type PayoutStatus = "pending" | "processing" | "processed" | "failed";

export interface PayoutRow {
  id: string;
  kind: "driver" | "vendor";
  name: string;
  phone: string;
  amount: number;
  status: PayoutStatus;
  method?: "razorpayx" | "manual";
  bank: { holderName: string; accountNumber: string; ifsc: string; verified: boolean };
  reference?: string;
  failureReason?: string;
  adminNote?: string;
  handledBy?: string;
  requestedAt: string;
  processedAt?: string;
}

type StatusStyle = { label: string; className: string; icon: typeof Hourglass };

export const refundStatusStyles: Record<RefundStatus, StatusStyle> = {
  due: { label: "Refund due", className: "bg-amber-500/10 text-amber-700 border-amber-200", icon: AlertTriangle },
  failed: { label: "Failed", className: "bg-rose-500/10 text-rose-700 border-rose-200", icon: XCircle },
  pending: { label: "With Razorpay", className: "bg-sky-500/10 text-sky-700 border-sky-200", icon: Loader2 },
  processed: { label: "Refunded", className: "bg-emerald-500/10 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
};

export const payoutStatusStyles: Record<PayoutStatus, StatusStyle> = {
  pending: { label: "To pay", className: "bg-amber-500/10 text-amber-700 border-amber-200", icon: Hourglass },
  processing: { label: "With RazorpayX", className: "bg-sky-500/10 text-sky-700 border-sky-200", icon: Loader2 },
  processed: { label: "Paid", className: "bg-emerald-500/10 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  failed: { label: "Rejected / failed", className: "bg-rose-500/10 text-rose-700 border-rose-200", icon: XCircle },
};

export const rupees = (value: number | undefined) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// date-fns throws on an invalid date; every API timestamp is checked first.
export const formatDate = (value: string | undefined, pattern = "MMM d, hh:mm a") => {
  const date = new Date(value || "");
  return Number.isNaN(date.getTime()) ? "—" : format(date, pattern);
};

export const orderLabel = (id: string) => `#${String(id || "").slice(-6)}`;
