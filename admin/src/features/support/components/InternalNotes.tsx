import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lock, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api-client";
import { useStaffPermissions } from "../hooks/useStaffPermissions";
import type { InternalNote } from "../supportExtras";

/** Private notes on a ticket. Only staff ever receive them — they are never part of the customer's chat. */
export function InternalNotes({ ticketId, notes = [] }: { ticketId: string; notes?: InternalNote[] }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { can } = useStaffPermissions();
  const [text, setText] = useState("");

  const add = useMutation({
    mutationFn: (note: string) => adminFetch(`/admin/tickets/${ticketId}/notes`, { method: "POST", body: JSON.stringify({ text: note }) }),
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (notes.length === 0 && !can("notes")) return null;

  return (
    <div className="border-t border-border bg-amber-50/60 dark:bg-amber-950/20 px-4 py-3 space-y-2">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700">
        <Lock className="h-3 w-3" />
        {t("supportTools.internalNotes", "Internal notes — not visible to the customer")}
      </p>
      {notes.length > 0 && (
        <ul className="space-y-1.5 max-h-28 overflow-y-auto">
          {notes.map((note, index) => (
            <li key={`${note.createdAt}-${index}`} className="text-xs text-foreground">
              <span className="font-semibold">{note.authorName}</span>
              <span className="text-muted-foreground"> · {new Date(note.createdAt).toLocaleString()}</span>
              <p className="whitespace-pre-wrap">{note.text}</p>
            </li>
          ))}
        </ul>
      )}
      {can("notes") && (
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && text.trim()) add.mutate(text.trim());
            }}
            placeholder={t("supportTools.addNote", "Add a private note…")}
            maxLength={2000}
            className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50"
          />
          <button
            type="button"
            disabled={!text.trim() || add.isPending}
            onClick={() => add.mutate(text.trim())}
            className="px-3 rounded-lg bg-foreground text-card text-sm font-semibold disabled:opacity-40"
            aria-label={t("supportTools.saveNote", "Save note")}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
