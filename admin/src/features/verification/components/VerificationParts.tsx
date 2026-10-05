import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, ExternalLink, FileText, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { appConfirm } from "@/lib/dialog";
import type { DocumentOption, VerificationReview } from "../types";

const STATUS_STYLES: Record<string, string> = {
  pending_approval: "bg-amber-100 text-amber-800",
  submitted: "bg-amber-100 text-amber-800",
  resubmission_required: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
  in_progress: "bg-muted text-muted-foreground",
};

function useStatusLabel() {
  const { t } = useTranslation();
  return (status?: string) =>
    ({
      pending_approval: t("verification.status.pending", "Pending review"),
      submitted: t("verification.status.pending", "Pending review"),
      resubmission_required: t("verification.status.resubmission", "Documents requested"),
      completed: t("verification.status.approved", "Approved"),
      approved: t("verification.status.approved", "Approved"),
      rejected: t("verification.status.rejected", "Rejected"),
      in_progress: t("verification.status.inProgress", "Onboarding in progress"),
    })[status || ""] ||
    status ||
    "—";
}

export function StatusPill({ status }: { status?: string }) {
  const label = useStatusLabel();
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status || ""] || "bg-muted text-muted-foreground"}`}>
      {label(status)}
    </span>
  );
}

/** Status filter pills with per-status counts from the queue endpoint. */
export function StatusTabs({
  options,
  value,
  onChange,
  counts,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  counts: Record<string, number>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value;
        const count = option.value === "all" ? undefined : counts[option.value];
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              active ? "border-brand-teal bg-brand-teal-soft text-brand-teal" : "border-border text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {option.label}
            {count !== undefined && (
              <span className={`rounded-full px-1.5 text-[11px] font-bold ${active ? "bg-brand-teal text-white" : "bg-muted"}`}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

/** One field; `verified` adds a verified / not-verified marker next to the value. */
export function DetailRow({ label, value, verified }: { label: string; value?: ReactNode; verified?: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 text-right font-medium text-foreground break-all">
        {value || <span className="text-muted-foreground">{t("verification.notProvided", "Not provided")}</span>}
        {verified !== undefined &&
          (verified ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-label={t("verification.verified", "Verified")} />
          ) : (
            <XCircle className="h-4 w-4 shrink-0 text-rose-500" aria-label={t("verification.notVerified", "Not verified")} />
          ))}
      </span>
    </div>
  );
}

/** An uploaded image (Cloudinary URL), opened in a new tab. */
export function DocumentImage({ label, url }: { label: string; url?: string }) {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="group block">
      <img src={url} alt={label} className="h-24 w-full rounded-xl border border-border object-cover group-hover:opacity-90" />
      <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        {label} <ExternalLink className="h-3 w-3" />
      </span>
    </a>
  );
}

/** The partner form sends file names only — show what the applicant attached. */
export function AttachedFile({ name }: { name?: string }) {
  const { t } = useTranslation();
  if (!name) return <span className="text-muted-foreground">{t("verification.noFile", "No file")}</span>;
  return (
    <span className="inline-flex items-center gap-1">
      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
      {name}
    </span>
  );
}

/** Banner for the last review decision (requested documents / rejection reason). */
export function ReviewHistory({ review, documentOptions }: { review?: VerificationReview; documentOptions: DocumentOption[] }) {
  const { t } = useTranslation();
  if (!review?.requestedDocuments?.length && !review?.rejectionReason) return null;

  const labelFor = (value: string) => documentOptions.find((option) => option.value === value)?.label || value;

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
      {review.requestedDocuments?.length ? (
        <p>
          <strong>{t("verification.requested", "Requested again")}:</strong> {review.requestedDocuments.map(labelFor).join(", ")}
          {review.resubmittedAt && (
            <span className="ml-1 text-blue-700">
              ({t("verification.resubmittedOn", "resubmitted {{date}}", { date: new Date(review.resubmittedAt).toLocaleString() })})
            </span>
          )}
        </p>
      ) : null}
      {review.note && (
        <p className="mt-1">
          <strong>{t("verification.note", "Note")}:</strong> {review.note}
        </p>
      )}
      {review.rejectionReason && (
        <p>
          <strong>{t("verification.rejectionReason", "Rejection reason")}:</strong> {review.rejectionReason}
        </p>
      )}
    </div>
  );
}

interface ReviewActionsProps {
  documentOptions: DocumentOption[];
  isPending: boolean;
  /** Hide Approve for an application that is already approved. */
  canApprove: boolean;
  onApprove: () => void;
  onReject: (reason?: string) => void;
  onRequestDocuments: (documents: string[], note?: string) => void;
}

/** Approve / Request documents / Reject, with the two follow-up dialogs. */
export function ReviewActions({ documentOptions, isPending, canApprove, onApprove, onReject, onRequestDocuments }: ReviewActionsProps) {
  const { t } = useTranslation();
  const [requestOpen, setRequestOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");

  const toggle = (value: string) =>
    setSelected((current) => (current.includes(value) ? current.filter((v) => v !== value) : [...current, value]));

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" className="text-rose-600 hover:text-rose-700" disabled={isPending} onClick={() => setRejectOpen(true)}>
          {t("verification.reject", "Reject")}
        </Button>
        <Button variant="outline" disabled={isPending} onClick={() => setRequestOpen(true)}>
          {t("verification.requestDocuments", "Request documents")}
        </Button>
        {canApprove && (
          <Button
            disabled={isPending}
            onClick={async () => {
              const approved = await appConfirm({
                title: t("verification.approveTitle", "Approve this application?"),
                description: t("verification.confirmApprove", "They will be able to start working immediately."),
                confirmLabel: t("verification.approve", "Approve"),
              });
              if (approved) onApprove();
            }}
          >
            {t("verification.approve", "Approve")}
          </Button>
        )}
      </div>

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t("verification.requestDocumentsTitle", "Ask for documents again")}</DialogTitle>
            <DialogDescription>
              {t(
                "verification.requestDocumentsDescription",
                "The applicant is notified and can't work until they resubmit and you approve again.",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {documentOptions.map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-sm hover:bg-muted/40">
                <Checkbox checked={selected.includes(option.value)} onCheckedChange={() => toggle(option.value)} />
                {option.label}
              </label>
            ))}
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              placeholder={t("verification.notePlaceholder", "What's wrong? e.g. \"The FSSAI licence copy is blurred\"")}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestOpen(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              disabled={selected.length === 0 || isPending}
              onClick={() => {
                onRequestDocuments(selected, note.trim() || undefined);
                setRequestOpen(false);
                setSelected([]);
                setNote("");
              }}
            >
              {t("verification.sendRequest", "Send request")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t("verification.rejectTitle", "Reject application")}</DialogTitle>
            <DialogDescription>
              {t("verification.rejectDescription", "Use this when the applicant should not be onboarded. To fix specific documents, request them instead.")}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            placeholder={t("verification.reasonPlaceholder", "Reason (shared with the applicant)")}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                onReject(reason.trim() || undefined);
                setRejectOpen(false);
                setReason("");
              }}
            >
              {t("verification.reject", "Reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

