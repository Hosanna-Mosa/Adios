import { useTranslation } from "react-i18next";
import type { OpenState } from "./hoursUtils";

/**
 * Promoted here from features/vendors/ once features/catalog/ (MeatCenters)
 * needed the exact same component. Used by both features' tables and View
 * dialogs.
 */
export function AvailabilityPill({ openState, isManuallyClosed }: { openState?: OpenState; isManuallyClosed?: boolean }) {
  const { t } = useTranslation();
  // A manual close always wins, exactly as the server evaluates it — so the pill is
  // right the instant the toggle is flipped, before the list has refetched.
  const manuallyClosed = isManuallyClosed === true;
  const isOpen = manuallyClosed ? false : openState ? openState.isOpen : true;
  const label = manuallyClosed ? t("hours.closed") : openState?.label || t("hours.openNow");

  return (
    <div className="space-y-1">
      <span
        className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
          isOpen ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        }`}
      >
        {label}
      </span>
      <p className="text-[10px] text-muted-foreground">{isManuallyClosed ? t("hours.closedByAdmin") : openState?.today || t("hours.noHoursSet")}</p>
    </div>
  );
}
