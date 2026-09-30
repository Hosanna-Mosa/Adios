import { UserCheck, UserX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getStaffRole } from "@/lib/session";
import type { Ticket } from "../types";

/** "Assigned to …" on a ticket card. Admin-only: a support member only ever sees their own cases. */
export function AssigneeBadge({ assignedTo }: Pick<Ticket, "assignedTo">) {
  const { t } = useTranslation();
  if (getStaffRole() !== "admin") return null;

  if (!assignedTo) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
        <UserX className="h-3 w-3" />
        {t("supportTeam.unassigned", "Unassigned")}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-teal-soft px-2 py-0.5 text-[10px] font-semibold text-brand-teal">
      <UserCheck className="h-3 w-3" />
      {t("supportTeam.assignedTo", { name: assignedTo.name, defaultValue: "Assigned to {{name}}" })}
    </span>
  );
}
