/** Value formatting for the profile screens.
 *
 * Pure functions — no JSX, no state. Lifted verbatim out of
 * app/(tabs)/profile.tsx so both profile screens can share them. */

export interface Field {
  label: string;
  value: string;
}

export function field(label: string, value: unknown): Field {
  return { label, value: value === null || value === undefined || value === "" ? "Not added" : String(value) };
}

export function yesNo(value?: boolean) {
  if (value === undefined || value === null) return "No";
  return value ? "Yes" : "No";
}

export function available(value?: string | null) {
  return value ? "Uploaded" : "Not uploaded";
}

export function formatDate(value?: string | null) {
  if (!value) return "Not added";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatMonthYear(value?: string | null) {
  if (!value) return "Not added";
  return new Date(value).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

export function formatCoordinates(coordinates?: number[]) {
  if (!coordinates || coordinates.length < 2) return "Not added";
  return `${coordinates[1]}, ${coordinates[0]}`;
}
