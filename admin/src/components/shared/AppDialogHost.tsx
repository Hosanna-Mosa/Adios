import { useSyncExternalStore } from "react";
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
import { getCurrentDialog, settleDialog, subscribeDialogs } from "@/lib/dialog";

/** Renders appAlert()/appConfirm() requests. Mounted once, in App.tsx. */
export function AppDialogHost() {
  const { t } = useTranslation();
  const dialog = useSyncExternalStore(subscribeDialogs, getCurrentDialog);

  return (
    <AlertDialog
      open={Boolean(dialog)}
      onOpenChange={(open) => {
        // Escape / outside click counts as "cancel".
        if (!open && dialog) settleDialog(dialog.id, false);
      }}
    >
      {dialog && (
        <AlertDialogContent
          key={dialog.id}
          className="rounded-3xl"
          // No description: tell Radix not to expect one.
          {...(dialog.description ? {} : { "aria-describedby": undefined })}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
            {dialog.description && <AlertDialogDescription>{dialog.description}</AlertDialogDescription>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            {dialog.kind === "confirm" && (
              <AlertDialogCancel onClick={() => settleDialog(dialog.id, false)}>
                {dialog.cancelLabel ?? t("common.cancel")}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              onClick={() => settleDialog(dialog.id, true)}
              className={
                dialog.tone === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
            >
              {dialog.confirmLabel ?? (dialog.kind === "confirm" ? t("common.confirm") : t("common.ok", "OK"))}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
