import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Clock, Flag } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { adminFetch } from "@/lib/api-client";
import { useStaffPermissions } from "../hooks/useStaffPermissions";
import { formatMinutes, TICKET_PRIORITIES, type SlaState, type TicketPriority, type TicketSla } from "../supportExtras";

const PRIORITY_STYLE: Record<TicketPriority, string> = {
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
  NORMAL: "bg-blue-100 text-blue-800 border-blue-200",
  HIGH: "bg-amber-100 text-amber-800 border-amber-200",
  URGENT: "bg-red-100 text-red-800 border-red-200",
};

export function PriorityBadge({ priority = "NORMAL" }: { priority?: TicketPriority }) {
  const { t } = useTranslation();
  return (
    <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${PRIORITY_STYLE[priority]}`}>
      {t(`supportTools.priority.${priority}`, priority.charAt(0) + priority.slice(1).toLowerCase())}
    </span>
  );
}

const SLA_STYLE: Record<SlaState, string> = {
  ok: "text-muted-foreground",
  due_soon: "text-amber-600",
  breached: "text-red-600",
  met: "text-green-600",
};

function minutesLeft(due: string | null) {
  return due ? Math.round((new Date(due).getTime() - Date.now()) / 60_000) : null;
}

/** The ticket's two timers: first reply and resolution — due in / overdue by / met in. */
export function SlaBadge({ sla, status }: { sla?: TicketSla | null; status: string }) {
  const { t } = useTranslation();
  if (!sla) return null;
  // The first-reply timer matters until staff answer; the resolution timer until the case closes.
  const showFirst = sla.firstResponseMinutes == null;
  const state = showFirst ? sla.firstResponse : sla.resolution;
  const left = minutesLeft(showFirst ? sla.firstResponseDueAt : sla.resolutionDueAt);
  const label = showFirst ? t("supportTools.sla.firstReply", "First reply") : t("supportTools.sla.resolution", "Resolution");
  const done = status === "RESOLVED";

  let text: string;
  if (done) text = `${t("supportTools.sla.resolvedIn", "Resolved in")} ${formatMinutes(sla.resolutionMinutes)}`;
  else if (state === "breached") text = `${label}: ${t("supportTools.sla.overdueBy", "overdue by")} ${formatMinutes(Math.abs(left ?? 0))}`;
  else text = `${label}: ${t("supportTools.sla.dueIn", "due in")} ${formatMinutes(Math.max(0, left ?? 0))}`;

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${done ? SLA_STYLE[sla.resolution] : SLA_STYLE[state]}`}>
      <Clock className="h-3 w-3" />
      {text}
    </span>
  );
}

/** "Set priority" entries for a ticket's actions menu; shown only to staff allowed to change it. */
export function PriorityMenuItems({ ticketId, current = "NORMAL" }: { ticketId: string; current?: TicketPriority }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { can } = useStaffPermissions();
  const setPriority = useMutation({
    mutationFn: (priority: TicketPriority) => adminFetch(`/admin/tickets/${ticketId}`, { method: "PUT", body: JSON.stringify({ priority }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets", "metrics"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
  if (!can("priority")) return null;
  return (
    <>
      {TICKET_PRIORITIES.filter((p) => p !== current).map((priority) => (
        <DropdownMenuItem key={priority} onClick={() => setPriority.mutate(priority)} className="cursor-pointer font-medium">
          <Flag className="mr-2 h-4 w-4 text-muted-foreground" />
          {t("supportTools.setPriority", "Set priority")}: {t(`supportTools.priority.${priority}`, priority.charAt(0) + priority.slice(1).toLowerCase())}
        </DropdownMenuItem>
      ))}
    </>
  );
}
