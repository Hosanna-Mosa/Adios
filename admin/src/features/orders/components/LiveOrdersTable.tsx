import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "@/components/motion/variants";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Star, GitBranch, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { LiveOrder } from "../liveOrdersTypes";

interface LiveOrdersTableProps {
  isLoading: boolean;
  filteredOrders: LiveOrder[];
  totalCount: number;
}

/** The "Ongoing Operations" table (rows + pagination) on LiveOrders.tsx. */
export function LiveOrdersTable({ isLoading, filteredOrders, totalCount }: LiveOrdersTableProps) {
  return (
    <div className="section-card">
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-success animate-pulse-dot" />
          <h3 className="text-lg font-semibold text-foreground">Ongoing Operations</h3>
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-t border-border">
            <th className="table-header-text text-left px-6 py-3">Order ID</th>
            <th className="table-header-text text-left px-6 py-3">User</th>
            <th className="table-header-text text-left px-6 py-3">Stops</th>
            <th className="table-header-text text-left px-6 py-3">Status</th>
            <th className="table-header-text text-left px-6 py-3">Assigned Driver</th>
            <th className="table-header-text text-left px-6 py-3">ETA</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">Loading orders...</td>
            </tr>
          ) : filteredOrders.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">No orders found matching the filter.</td>
            </tr>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
            {filteredOrders.map((o) => (
              <motion.tr
                key={o._id}
                layout
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="border-t border-border hover:bg-muted/30 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-primary">
                  <Link to={`/live-orders/${o._id}`} className="hover:underline">
                    {o._id.startsWith("ORD-") ? o._id : `#${o._id.substring(o._id.length - 6).toUpperCase()}`}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {o.user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "U"}
                    </div>
                    <span className="text-sm text-foreground">{o.user?.name || "Unknown User"}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    {o.stops?.length === 1 ? <MapPin className="h-3.5 w-3.5" /> : <GitBranch className="h-3.5 w-3.5" />}
                    {o.stops?.length || 0} stops
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={o.status} variant={o.status === "DELIVERED" ? "delivered" : o.status === "PICKED_UP" ? "transit" : "assigned"} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${!o.driver ? "italic text-muted-foreground" : "text-foreground"}`}>{o.driver?.user?.name || "Awaiting assignment..."}</span>
                    {o.driver && (
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-warning text-warning" /> 4.8
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className={`text-xs text-muted-foreground`}>Created</p>
                  </div>
                </td>
              </motion.tr>
            ))}
            </AnimatePresence>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
        <p className="text-sm text-muted-foreground">Showing <span className="font-semibold text-foreground">{totalCount}</span> results</p>
        <div className="flex gap-1">
          <button
            onClick={() => toast.info("No previous pages")}
            className="px-3 py-1.5 text-sm border border-border rounded-lg text-muted-foreground hover:bg-muted/50"
          >
            Previous
          </button>
          <button
            onClick={() => toast.info("No next pages")}
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg font-medium"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
