// Field rules for the sign-in screen (app/index.tsx). The identifier field takes a phone
// number or an email, and "Continue with OTP" used to accept anything with ten digits
// somewhere in it — "user1234567890@mail.com" sent a code to a number nobody typed.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (value: string) => EMAIL_PATTERN.test(value.trim());

/**
 * The 10-digit mobile number in what was typed, or null when it isn't one. Spaces, dashes
 * and a +91 / 0 prefix are fine; letters and an '@' are not.
 */
export function toMobileNumber(value: string): string | null {
  const text = value.trim();
  if (!text || /[^\d\s+()-]/.test(text)) return null;
  let digits = text.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits.length === 10 ? digits : null;
}

/** Whether the sign-in identifier is a usable phone number or email. */
export const isValidIdentifier = (value: string) => (value.includes("@") ? isValidEmail(value) : toMobileNumber(value) !== null);
