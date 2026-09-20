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

export const statusStyles: Record<ScheduledRequest["status"], { label: string; className: string; icon: typeof Clock }> = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-700 border-amber-200",
    icon: Hourglass,
  },
  accepted: {
    label: "Accepted",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-500/10 text-rose-700 border-rose-200",
    icon: XCircle,
  },
};
