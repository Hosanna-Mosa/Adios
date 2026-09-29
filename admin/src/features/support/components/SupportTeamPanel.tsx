import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { KeyRound, Loader2, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SupportMemberDialog } from "./SupportMemberDialog";
import type { useSupportMembers } from "../hooks/useSupportMembers";
import type { SupportMember } from "../types";

type Props = Pick<ReturnType<typeof useSupportMembers>, "members" | "isLoading" | "resetPassword" | "removeMember"> & {
  onAddMember: () => void;
};

/** The admin-only "Support Team" tab on the Support page. */
export function SupportTeamPanel({ members, isLoading, resetPassword, removeMember, onAddMember }: Props) {
  const { t, i18n } = useTranslation();
  const [resetTarget, setResetTarget] = useState<SupportMember | null>(null);
  const [removeTarget, setRemoveTarget] = useState<SupportMember | null>(null);

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      await removeMember.mutateAsync(removeTarget._id);
      toast.success(t("supportTeam.memberRemoved", { name: removeTarget.name, defaultValue: "{{name}} can no longer sign in." }));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setRemoveTarget(null);
    }
  };

  return (
    <div className="section-card">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div>
          <h2 className="text-base font-bold text-foreground">{t("supportTeam.title", "Support team")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("supportTeam.subtitleAssigned", {
              limit: members[0]?.caseLimit ?? 6,
              defaultValue:
                "New cases go automatically to whoever has the fewest open cases, up to {{limit}} each. Members see only their own cases — no orders, payments, users or settings.",
            })}
          </p>
        </div>
        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
          {t("supportTeam.memberCount", { count: members.length, defaultValue: "{{count}} members" })}
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center text-center py-20 px-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <p className="font-bold text-foreground">{t("supportTeam.emptyTitle", "No support members yet")}</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {t("supportTeam.emptyDesc", "Add a member to give them their own login for handling customer and driver cases.")}
          </p>
          <button
            onClick={onAddMember}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <UserPlus className="h-4 w-4" />
            {t("supportTeam.addNewMember", "Add new member")}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-6 py-3 font-bold">{t("supportTeam.member", "Member")}</th>
                <th className="px-6 py-3 font-bold">{t("supportTeam.loginEmail", "Login email")}</th>
                <th className="px-6 py-3 font-bold">{t("supportTeam.workload", "Open cases")}</th>
                <th className="px-6 py-3 font-bold">{t("supportTeam.password", "Password")}</th>
                <th className="px-6 py-3 font-bold">{t("supportTeam.added", "Added")}</th>
                <th className="px-6 py-3 font-bold text-right">{t("supportTeam.actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-brand-teal-soft text-brand-teal flex items-center justify-center font-bold shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{member.name}</p>
                        <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          {t("panelAuth.supportAgent", "Support Agent")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">{member.email}</td>
                  <td className="px-6 py-4">
                    <Workload member={member} />
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="font-mono tracking-widest text-muted-foreground"
                      title={t("supportTeam.passwordHiddenHint", "Stored encrypted — reset it to set a new one.")}
                    >
                      ••••••••
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(member.createdAt).toLocaleDateString(i18n.language, { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setResetTarget(member)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        {t("supportTeam.resetPassword", "Reset password")}
                      </button>
                      <button
                        onClick={() => setRemoveTarget(member)}
                        className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label={t("supportTeam.remove", "Remove")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {resetTarget && (
        <SupportMemberDialog
          mode="reset"
          member={resetTarget}
          open
          onOpenChange={(open) => !open && setResetTarget(null)}
          onSubmit={({ password }) => resetPassword.mutateAsync({ id: resetTarget._id, password })}
        />
      )}

      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("supportTeam.removeTitle", { name: removeTarget?.name, defaultValue: "Remove {{name}}?" })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("supportTeam.removeDesc", "Their account is deleted and they're signed out immediately. Tickets they replied to are kept.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("supportTeam.cancel", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("supportTeam.remove", "Remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Workload({ member }: { member: SupportMember }) {
  const { t } = useTranslation();
  const isFull = member.openCount >= member.caseLimit;
  const fill = Math.min(member.openCount / member.caseLimit, 1) * 100;
  return (
    <div className="min-w-[120px]">
      <div className="flex items-baseline gap-1.5">
        <span className={`font-bold ${isFull ? "text-destructive" : "text-foreground"}`}>
          {member.openCount} / {member.caseLimit}
        </span>
        {isFull && <span className="text-[10px] font-bold uppercase text-destructive">{t("supportTeam.full", "Full")}</span>}
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${isFull ? "bg-destructive" : "bg-primary"}`} style={{ width: `${fill}%` }} />
      </div>
      {member.pendingCount > 0 && (
        <p className="mt-1 text-[10px] text-muted-foreground">
          {t("supportTeam.awaitingConfirmation", { count: member.pendingCount, defaultValue: "+{{count}} awaiting customer" })}
        </p>
      )}
    </div>
  );
}
