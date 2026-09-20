import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Ban, Eye, MoreVertical } from "lucide-react";
import { fadeIn } from "@/components/motion/variants";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ManifestItem } from "../types";

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-destructive text-destructive-foreground",
  STANDARD: "bg-muted text-muted-foreground",
  EXPRESS: "bg-primary text-primary-foreground",
};

interface ActiveManifestsTableProps {
  manifests: ManifestItem[];
}

/**
 * The "Active Manifests" table. Hand-rolled rather than the shared
 * DataTable: the original never rendered a loading or empty-results row
 * at all (an empty `manifests` array just yields a blank table body), and
 * DataTable always renders an emptyLabel row when data.length is 0 --
 * forcing that here would show new placeholder text this page never had.
 */
export function ActiveManifestsTable({ manifests }: ActiveManifestsTableProps) {
  return (
    <div className="section-card">
      <div className="flex items-center justify-between p-6 pb-4">
        <h3 className="text-lg font-semibold text-foreground">Active Manifests</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Filter by Status:</span>
          <select onChange={(e) => toast.info(`Manifest table filtered by status: ${e.target.value}`)} className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground">
            <option value="All Statuses">All Statuses</option>
            <option value="High Priority">High Priority Only</option>
            <option value="Standard Priority">Standard Only</option>
          </select>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-t border-border">
            <th className="table-header-text text-left px-6 py-3">Order ID</th>
            <th className="table-header-text text-left px-6 py-3">Destination</th>
            <th className="table-header-text text-left px-6 py-3">Driver</th>
            <th className="table-header-text text-left px-6 py-3">Estimated Delivery</th>
            <th className="table-header-text text-left px-6 py-3">Priority</th>
            <th className="table-header-text text-left px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout" initial={false}>
            {manifests.map((m) => (
              <motion.tr key={m.id} layout variants={fadeIn} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-primary">{m.id}</td>
                <td className="px-6 py-4 text-sm text-foreground">{m.dest}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {m.driver
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span className="text-sm text-foreground">{m.driver}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{m.eta}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${PRIORITY_STYLES[m.priority] || "bg-muted text-muted-foreground"}`}>{m.priority}</span>
                </td>
                <td className="px-6 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-muted rounded transition-colors">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.info(`Viewing details of manifest ${m.id}`)} className="gap-2 cursor-pointer">
                        <Eye className="h-4 w-4 text-muted-foreground" /> View Manifest
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success(`Manifest ${m.id} routing recalculated!`)} className="gap-2 cursor-pointer">
                        Optimize Route
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.error(`Manifest ${m.id} has been cancelled.`)} className="gap-2 text-destructive focus:text-destructive cursor-pointer">
                        <Ban className="h-4 w-4" /> Cancel Manifest
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
