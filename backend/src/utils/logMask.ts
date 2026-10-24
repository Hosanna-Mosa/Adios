/**
 * Log-safe forms of personal data. Server logs end up in hosting dashboards and
 * log drains that far more people can read than the database, so phone numbers
 * and email addresses are never written in full — enough is kept to tell two
 * records apart while debugging, nothing that identifies the person.
 */

/** "+91 98765 43210" → "******3210". */
export const maskPhone = (phone: unknown): string => {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (!digits) return "(none)";
  return `******${digits.slice(-4)}`;
};

/** "dhanush@example.com" → "d***@example.com". */
export const maskEmail = (email: unknown): string => {
  const value = String(email ?? "").trim();
  const at = value.indexOf("@");
  if (at < 1) return value ? "***" : "(none)";
  return `${value[0]}***${value.slice(at)}`;
};
