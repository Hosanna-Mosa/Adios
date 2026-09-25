import { FormEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSubmit: (event: FormEvent) => void;
  submitLabel: string;
  submitPendingLabel?: string;
  isSubmitting?: boolean;
  contentClassName?: string;
  formClassName?: string;
  submitButtonClassName?: string;
  children: ReactNode;
}

/**
 * A `<Dialog>` wrapping a `<form>` with a single submit button — the
 * "add/edit X" pattern every create dialog (Add User, Add Vendor, ...)
 * hand-wrote. Generic: the fields are passed in as children, and it knows
 * nothing about what it's submitting.
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  onSubmit,
  submitLabel,
  submitPendingLabel,
  isSubmitting = false,
  contentClassName = "sm:max-w-[450px] rounded-3xl",
  formClassName = "space-y-4 py-4",
  submitButtonClassName = "w-full mt-4",
  children,
}: FormDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClassName}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className={formClassName}>
          {children}
          <Button type="submit" className={submitButtonClassName} disabled={isSubmitting}>
            {isSubmitting ? (submitPendingLabel ?? t("common.savingEllipsis")) : submitLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
