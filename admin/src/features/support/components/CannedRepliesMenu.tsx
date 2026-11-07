import { useMemo, useState } from "react";
import { MessageSquareText, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useCannedReplies } from "../hooks/useCannedReplies";
import { useStaffPermissions } from "../hooks/useStaffPermissions";
import { fillCannedReply, type CannedReply } from "../supportExtras";

interface Props {
  /** Receives the reply text, already filled in for this customer. */
  onPick: (text: string) => void;
  customerName?: string;
}

/** "Canned replies" button for a reply box: pick a saved answer; people with permission can manage the list. */
export function CannedRepliesMenu({ onPick, customerName }: Props) {
  const { t } = useTranslation();
  const { replies, isLoading } = useCannedReplies();
  const { can } = useStaffPermissions();
  const [open, setOpen] = useState(false);
  const [managing, setManaging] = useState(false);
  const [search, setSearch] = useState("");

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? replies.filter((r) => `${r.title} ${r.body} ${r.category ?? ""}`.toLowerCase().includes(q)) : replies;
  }, [replies, search]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg border border-transparent hover:border-border transition-colors">
            <MessageSquareText className="h-4 w-4" />
            {t("supportTools.cannedReplies", "Canned replies")}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("supportTools.searchReplies", "Search replies")} className="h-9 mb-2" />
          <div className="max-h-64 overflow-y-auto space-y-1">
            {isLoading ? (
              <p className="p-3 text-xs text-muted-foreground">{t("common.loading", "Loading…")}</p>
            ) : shown.length === 0 ? (
              <p className="p-3 text-xs text-muted-foreground">{t("supportTools.noReplies", "No canned replies yet.")}</p>
            ) : (
              shown.map((reply) => (
                <button
                  key={reply._id}
                  type="button"
                  onClick={() => {
                    onPick(fillCannedReply(reply.body, customerName));
                    setOpen(false);
                  }}
                  className="w-full text-left rounded-lg px-3 py-2 hover:bg-muted transition-colors"
                >
                  <p className="text-sm font-semibold text-foreground">{reply.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{reply.body}</p>
                </button>
              ))
            )}
          </div>
          {can("manage_canned") && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => {
                setOpen(false);
                setManaging(true);
              }}
            >
              {t("supportTools.manageReplies", "Manage replies")}
            </Button>
          )}
        </PopoverContent>
      </Popover>
      {can("manage_canned") && <ManageCannedReplies open={managing} onOpenChange={setManaging} />}
    </>
  );
}

const EMPTY = { title: "", body: "", category: "" };

function ManageCannedReplies({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const { replies, create, update, remove } = useCannedReplies();
  const [editing, setEditing] = useState<CannedReply | null>(null);
  const [form, setForm] = useState(EMPTY);
  const busy = create.isPending || update.isPending;

  const startEdit = (reply: CannedReply | null) => {
    setEditing(reply);
    setForm(reply ? { title: reply.title, body: reply.body, category: reply.category ?? "" } : EMPTY);
  };

  const save = async () => {
    if (!form.title.trim() || !form.body.trim()) return toast.error(t("supportTools.replyNeedsTitleAndText", "Enter a title and the reply text."));
    try {
      if (editing) await update.mutateAsync({ ...editing, ...form });
      else await create.mutateAsync(form);
      toast.success(t("supportTools.replySaved", "Reply saved."));
      startEdit(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] rounded-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("supportTools.manageReplies", "Manage replies")}</DialogTitle>
          <DialogDescription>{t("supportTools.manageRepliesDesc", "Use {{name}} in a reply to insert the customer's first name.")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t("supportTools.replyTitle", "Title, e.g. Refund started")} maxLength={80} />
          <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder={t("supportTools.replyCategory", "Group (optional), e.g. Refunds")} maxLength={40} />
          <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder={t("supportTools.replyText", "Hi {{name}}, …")} rows={4} maxLength={2000} />
          <div className="flex gap-2">
            <Button onClick={save} disabled={busy}>
              {editing ? <Pencil className="h-4 w-4 mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
              {editing ? t("supportTools.updateReply", "Update reply") : t("supportTools.addReply", "Add reply")}
            </Button>
            {editing && (
              <Button variant="ghost" onClick={() => startEdit(null)}>
                {t("common.cancel", "Cancel")}
              </Button>
            )}
          </div>
        </div>

        <div className="divide-y divide-border rounded-xl border border-border">
          {replies.length === 0 && <p className="p-4 text-sm text-muted-foreground">{t("supportTools.noReplies", "No canned replies yet.")}</p>}
          {replies.map((reply) => (
            <div key={reply._id} className="flex items-start justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {reply.title}
                  {reply.category && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{reply.category}</span>}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">{reply.body}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => startEdit(reply)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground" aria-label={t("common.edit", "Edit")}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove.mutate(reply._id, { onError: (err) => toast.error((err as Error).message) })}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"
                  aria-label={t("common.delete", "Delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
