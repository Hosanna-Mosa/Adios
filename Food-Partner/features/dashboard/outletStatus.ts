import type { TFunction } from "i18next";
import type { BadgeTone } from "@/components/ui/Badge";
import type { PartnerProfile } from "@/types/models";

/**
 * Why the outlet is or isn't taking orders — worked out in this one place so
 * the header badge and the "Accepting orders" card can never disagree.
 *
 * The server's openState.isOpen combines three things: the Adios team's
 * switch (isOpen), the partner's own switch (isManuallyClosed) and the
 * opening hours. The switch only shows the partner's flag, so "switch on but
 * Closed" means the hours — and the badge says so instead of a bare "Closed".
 */
export type OutletStatusKind = "closedByTeam" | "paused" | "pending" | "outsideHours" | "open";

export interface OutletStatus {
  kind: OutletStatusKind;
  /** The partner's switch, as it should be drawn. */
  accepting: boolean;
  badge: { label: string; tone: BadgeTone };
  /** The line under "Accepting orders". */
  description: string;
}

/** "Closed · opens 9:00 AM" from the server → just the time, so it can be shown in the partner's language. */
const opensAt = (label: string | undefined) => label?.match(/opens\s+(.+)$/i)?.[1]?.trim();

export function outletStatus(profile: PartnerProfile | null | undefined, t: TFunction): OutletStatus | null {
  if (!profile) return null;
  if (profile.isOpen === false) {
    return {
      kind: "closedByTeam",
      accepting: false,
      badge: { label: t("dashboard.closedByTeam"), tone: "error" },
      description: t("outlet.closedByTeam"),
    };
  }
  if (profile.isManuallyClosed) {
    return { kind: "paused", accepting: false, badge: { label: t("dashboard.paused"), tone: "error" }, description: t("outlet.pausedHint") };
  }
  if (profile.openStatePending) {
    return { kind: "pending", accepting: true, badge: { label: t("dashboard.checkingHours"), tone: "neutral" }, description: t("outlet.acceptingHint") };
  }
  // Until the server's open state arrives (sign-in snapshot), show no badge rather than a guess.
  if (!profile.openState) return null;
  if (!profile.openState.isOpen) {
    const time = opensAt(profile.openState.label);
    return {
      kind: "outsideHours",
      accepting: true,
      badge: { label: time ? t("dashboard.closedOpensAt", { time }) : t("dashboard.closedOutsideHours"), tone: "warning" },
      description: t("outlet.outsideHoursHint"),
    };
  }
  return { kind: "open", accepting: true, badge: { label: t("dashboard.openNow"), tone: "success" }, description: t("outlet.acceptingHint") };
}
