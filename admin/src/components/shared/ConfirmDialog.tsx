import { useTranslation } from "react-i18next";
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

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  /** Styles the confirm button as destructive (red), for delete/remove
   *  actions. Defaults to true since that's every current use case. */
  destructive?: boolean;
}

/**
 * A styled confirmation modal built on the existing (previously unused)
 * shadcn AlertDialog primitive.
 *
 * NOTE: every confirmation flow in this app today (Users, Vendors, Drivers,
 * MeatCenters, ...) uses the browser's native `confirm()`, not a Dialog.
 * This component is built now per the refactor plan's Phase 2 shared-piece
 * list, but it is NOT wired into any page yet — swapping native `confirm()`
 * for a styled modal is a real, visible UI/interaction change (different
 * look, async instead of blocking, different keyboard handling), which
 * conflicts with this refactor's "zero UI change" rule. It's available for
 * a future, explicitly-approved pass that migrates those `confirm()` calls.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  destructive = true,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel ?? t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined}
          >
            {confirmLabel ?? t("common.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
