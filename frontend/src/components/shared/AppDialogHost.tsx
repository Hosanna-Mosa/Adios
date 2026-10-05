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
          className="rounded-2xl"
          // No description: tell Radix not to expect one.
          {...(dialog.description ? {} : { "aria-describedby": undefined })}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              {dialog.title}
            </AlertDialogTitle>
            {dialog.description && (
              <AlertDialogDescription>
                {dialog.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            {dialog.kind === "confirm" && (
              <AlertDialogCancel
                className="rounded-xl"
                onClick={() => settleDialog(dialog.id, false)}
              >
                {dialog.cancelLabel ?? t("dialog.cancel", "Cancel")}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              onClick={() => settleDialog(dialog.id, true)}
              className={`rounded-xl ${
                dialog.tone === "destructive"
                  ? "bg-red-600 text-white hover:bg-red-600/90"
                  : "bg-brand-kinetic text-white hover:bg-brand-kinetic/90"
              }`}
            >
              {dialog.confirmLabel ??
                (dialog.kind === "confirm"
                  ? t("dialog.confirm", "Confirm")
                  : t("dialog.ok", "OK"))}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
