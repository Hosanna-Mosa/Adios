/** Value formatting for the profile screens.
 *
 * Pure functions — no JSX, no state. Lifted verbatim out of
 * app/(tabs)/profile.tsx so both profile screens can share them. */
import i18n from "@/i18n";

export interface Field {
  label: string;
  value: string;
}

export function field(label: string, value: unknown): Field {
  return { label, value: value === null || value === undefined || value === "" ? i18n.t("profile.notAdded") : String(value) };
}

export function yesNo(value?: boolean) {
  if (value === undefined || value === null) return i18n.t("actions.no");
  return value ? i18n.t("actions.yes") : i18n.t("actions.no");
}

export function available(value?: string | null) {
  return value ? i18n.t("profile.uploaded") : i18n.t("profile.notUploaded");
}

export function formatDate(value?: string | null) {
  if (!value) return i18n.t("profile.notAdded");
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatMonthYear(value?: string | null) {
  if (!value) return i18n.t("profile.notAdded");
  return new Date(value).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

export function formatCoordinates(coordinates?: number[]) {
  if (!coordinates || coordinates.length < 2) return i18n.t("profile.notAdded");
  return `${coordinates[1]}, ${coordinates[0]}`;
}
