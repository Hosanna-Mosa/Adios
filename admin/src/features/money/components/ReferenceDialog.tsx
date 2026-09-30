import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ReferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** What is being paid / refunded, shown above the fields. */
  summary: React.ReactNode;
  fieldLabel: string;
  fieldPlaceholder: string;
  /** Adds an optional note field under the main one. */
  withNote?: boolean;
  submitLabel: string;
  destructive?: boolean;
  isSubmitting: boolean;
  onSubmit: (value: string, note?: string) => void;
}

/** One dialog for "Mark paid", "Mark refunded" and "Reject": a required reference/reason, plus an optional note. */
export function ReferenceDialog({
  open, onOpenChange, title, description, summary, fieldLabel, fieldPlaceholder, withNote,
  submitLabel, destructive, isSubmitting, onSubmit,
}: ReferenceDialogProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setValue("");
      setNote("");
    }
  }, [open]);

  const trimmed = value.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (trimmed.length >= 3) onSubmit(trimmed, note.trim() || undefined);
          }}
        >
          <div className="rounded-2xl bg-muted/50 p-4 text-sm space-y-1">{summary}</div>
          <div className="space-y-2">
            <label htmlFor="money-reference" className="text-sm font-medium">{fieldLabel}</label>
            {destructive ? (
              <Textarea id="money-reference" value={value} onChange={(e) => setValue(e.target.value)} placeholder={fieldPlaceholder} />
            ) : (
              <Input id="money-reference" value={value} onChange={(e) => setValue(e.target.value)} placeholder={fieldPlaceholder} autoComplete="off" />
            )}
          </div>
          {withNote && (
            <div className="space-y-2">
              <label htmlFor="money-note" className="text-sm font-medium">{t("money.fieldNoteOptional")}</label>
              <Textarea id="money-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("money.fieldNotePlaceholder")} />
            </div>
          )}
          <Button
            type="submit"
            variant={destructive ? "destructive" : "default"}
            className="w-full h-11 rounded-xl"
            disabled={isSubmitting || trimmed.length < 3}
          >
            {isSubmitting ? t("common.savingEllipsis") : submitLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
