import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { Pagination } from "@/components/shared/Pagination";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { fadeIn } from "@/components/motion/variants";
import { CalendarClock, Hourglass, CheckCircle2, XCircle, SlidersHorizontal } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ScheduleStatus = "pending" | "accepted" | "rejected";

interface ScheduledOrder {
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

const statusStyles: Record<ScheduleStatus, { label: string; className: string; icon: typeof Hourglass }> = {
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

// Orders created before a verdict exists carry a null scheduleStatus — they are still awaiting one.
const scheduleStatusOf = (order: ScheduledOrder): ScheduleStatus => order.scheduleStatus || "pending";

// The boot seeder writes literal ORD-#### ids; real orders use a generated string id.
const orderLabel = (id: string) => {
  const value = String(id || "");
  return value.startsWith("ORD-") ? value : `#${value.slice(-6)}`;
};

// date-fns throws on an invalid date, which would take the whole table down, so every
// timestamp coming off the API is validated before it is formatted.
const formatDate = (value: string | undefined, pattern: string) => {
  const date = new Date(value || "");
  return Number.isNaN(date.getTime()) ? "—" : format(date, pattern);
};

const formatSlot = (value: string) => formatDate(value, "EEE, MMM d · hh:mm a");

export default function ScheduledOrders() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"ALL" | ScheduleStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectingOrder, setRejectingOrder] = useState<ScheduledOrder | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin", "scheduled-orders"],
    queryFn: () => adminFetch<ScheduledOrder[]>("/orders/scheduled"),
    refetchInterval: 15000,
  });

  const decisionMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: "accept" | "reject"; reason?: string }) =>
      adminFetch(`/orders/${id}/schedule`, {
        method: "PATCH",
        body: JSON.stringify(reason ? { action, reason } : { action }),
      }),
    onSuccess: (_data, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "scheduled-orders"] });
      toast.success(action === "accept" ? "Scheduled order accepted" : "Scheduled order rejected");
      setRejectingOrder(null);
      setRejectReason("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update the scheduled order");
    },
  });

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingOrder) return;
    decisionMutation.mutate({
      id: rejectingOrder._id,
      action: "reject",
      reason: rejectReason.trim() || undefined,
    });
  };

  const pendingCount = orders.filter((order) => scheduleStatusOf(order) === "pending").length;
  const acceptedCount = orders.filter((order) => scheduleStatusOf(order) === "accepted").length;
  const rejectedCount = orders.filter((order) => scheduleStatusOf(order) === "rejected").length;

  const filteredOrders = orders.filter((order) =>
    statusFilter === "ALL" ? true : scheduleStatusOf(order) === statusFilter
  );

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  return (
    <DashboardLayout searchPlaceholder="Search scheduled orders...">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">Scheduled Orders</h1>
            <p className="page-subtitle">Approve or decline the delivery slots customers booked ahead of time.</p>
          </div>
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
                  <SlidersHorizontal className="h-4 w-4" /> Filter: {statusFilter}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setStatusFilter("ALL"); setCurrentPage(1); }} className="cursor-pointer">All Requests</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter("pending"); setCurrentPage(1); }} className="cursor-pointer">Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter("accepted"); setCurrentPage(1); }} className="cursor-pointer">Accepted</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter("rejected"); setCurrentPage(1); }} className="cursor-pointer">Rejected</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <StaggerList className="grid grid-cols-3 gap-4">
          <StaggerItem>
            <StatCard
              icon={<Hourglass className="h-5 w-5" />}
              label="Awaiting Action"
              value={pendingCount.toString()}
              badge="Needs a decision"
              badgeColor="destructive"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Accepted" value={acceptedCount.toString()} />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={<XCircle className="h-5 w-5" />} label="Rejected" value={rejectedCount.toString()} badge="Customer notified" badgeColor="muted" />
          </StaggerItem>
        </StaggerList>

        <div className="section-card">
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Booked Slots</h3>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="table-header-text text-left px-6 py-3">Order</th>
                <th className="table-header-text text-left px-6 py-3">Customer</th>
                <th className="table-header-text text-left px-6 py-3">Restaurant</th>
                <th className="table-header-text text-left px-6 py-3">Requested Slot</th>
                <th className="table-header-text text-left px-6 py-3">Status</th>
                <th className="table-header-text text-left px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">Loading scheduled orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                    No scheduled orders yet. They appear here as soon as a customer books a later slot at checkout.
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">No scheduled orders match the filter.</td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout" initial={false}>
                {paginatedOrders.map((order) => {
                  const scheduleStatus = scheduleStatusOf(order);
                  const status = statusStyles[scheduleStatus];
                  const StatusIcon = status.icon;
                  const isDeciding = decisionMutation.isPending && decisionMutation.variables?.id === order._id;

                  return (
                    <motion.tr
                      key={order._id}
                      layout
                      variants={fadeIn}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0 }}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-foreground">{orderLabel(order._id)}</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{order.totalPrice || 0} · {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? "" : "s"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-foreground">{order.user?.name || "Customer"}</p>
                        <p className="text-xs text-muted-foreground">{order.user?.phone || "N/A"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-foreground">{order.vendor?.name || "—"}</p>
                        <p className="text-xs text-muted-foreground max-w-[200px] truncate">{order.vendor?.address || ""}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-foreground">{formatSlot(order.scheduledFor)}</p>
                        <p className="text-xs text-muted-foreground">
                          Booked {formatDate(order.createdAt, "MMM d, hh:mm a")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border inline-flex items-center gap-1 ${status.className}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </span>
                        {scheduleStatus === "rejected" && order.scheduleRejectionReason && (
                          <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">{order.scheduleRejectionReason}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {scheduleStatus === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              disabled={isDeciding}
                              onClick={() => { setRejectingOrder(order); setRejectReason(""); }}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="rounded-lg"
                              disabled={isDeciding}
                              onClick={() => decisionMutation.mutate({ id: order._id, action: "accept" })}
                            >
                              {isDeciding ? "Saving..." : "Accept"}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No action needed</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
                </AnimatePresence>
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemLabel="scheduled orders"
            shownCount={paginatedOrders.length}
            totalCount={filteredOrders.length}
          />
        </div>
      </div>

      {/* Reject Dialog — the reason is optional and rides along to the customer's notification */}
      <Dialog open={!!rejectingOrder} onOpenChange={(open) => { if (!open) { setRejectingOrder(null); setRejectReason(""); } }}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Reject Scheduled Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReject} className="space-y-4 py-4">
            {rejectingOrder && (
              <div className="rounded-2xl bg-muted/50 p-4 space-y-1 text-sm">
                <p className="font-semibold text-foreground">{orderLabel(rejectingOrder._id)}</p>
                <p className="text-muted-foreground">
                  {rejectingOrder.user?.name || "Customer"} · {rejectingOrder.vendor?.name || "Restaurant"}
                </p>
                <p className="text-muted-foreground">{formatSlot(rejectingOrder.scheduledFor)}</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason (optional)</label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. The kitchen is fully booked for that slot"
              />
              <p className="text-xs text-muted-foreground">
                The customer is notified of the rejection either way; a reason is shown with it.
              </p>
            </div>
            <Button type="submit" variant="destructive" className="w-full h-11 rounded-xl" disabled={decisionMutation.isPending}>
              {decisionMutation.isPending ? "Rejecting..." : "Reject Order"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
