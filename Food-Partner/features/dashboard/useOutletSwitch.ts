import { useTranslation } from "react-i18next";
import { showAlert } from "@/components/ui/AppAlert";
import { useToast } from "@/components/ui/Toast";
import { useSetOutletOpen } from "@/queries/profile.queries";
import type { PartnerProfile } from "@/types/models";
import { errorMessage } from "@/utils/errorMessage";
import { outletStatus } from "./outletStatus";

/**
 * The "Accepting orders" switch. Turning it off during a rush by accident
 * would silently cost orders, so pausing asks first; resuming doesn't.
 */
export function useOutletSwitch(profile: PartnerProfile | null, loaded: boolean) {
  const { t } = useTranslation();
  const toast = useToast();
  const mutation = useSetOutletOpen();
  const status = outletStatus(profile, t);

  const apply = (next: boolean) =>
    mutation.mutate(next, {
      onSuccess: (fresh) => {
        if (!next) toast.show(t("outlet.pausedToast"), "info");
        else toast.show(fresh?.openState?.isOpen ? t("outlet.openToast") : t("outlet.outsideHoursToast"), "success");
      },
      onError: (error) => toast.show(errorMessage(error, t("outlet.updateFailed")), "error"),
    });

  const toggle = (next: boolean) => {
    if (next) return apply(true);
    showAlert(
      t("outlet.pauseTitle"),
      t("outlet.pauseMessage"),
      [
        { text: t("actions.cancel"), style: "cancel" },
        { text: t("outlet.pause"), style: "destructive", onPress: () => apply(false) },
      ],
      "warning",
    );
  };

  return {
    accepting: status?.accepting ?? !profile?.isManuallyClosed,
    description: status?.description ?? t("outlet.acceptingHint"),
    /** On, but closed by the schedule: the card offers a way to the hours. */
    outsideHours: status?.kind === "outsideHours",
    // Until the real profile arrives the switch would show a guess, so it waits.
    disabled: !loaded || mutation.isPending,
    toggle,
  };
}
