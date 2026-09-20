// Field rules for app/personal-details.tsx. The screen used to PATCH whatever
// was typed and only surfaced a problem when the server rejected it — an empty
// name, a one-character name and "abc" as an email all reached the API.
//
// Each rule returns the message to show under the field, or "" when it passes.

export interface PersonalDetailsValues {
  name: string;
  username: string;
  email: string;
}

export type PersonalDetailsErrors = Partial<Record<keyof PersonalDetailsValues, string>>;

// Letters (any script), spaces and the punctuation real names carry.
const NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]*$/u;
// Matches the backend's own handle shape: starts with a letter, then letters,
// digits, dot or underscore.
const USERNAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9._]*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateName(value: string) {
  const name = value.trim();
  if (!name) return "Full name is required.";
  if (name.length < 3) return "Use at least 3 characters.";
  if (name.length > 50) return "Keep it under 50 characters.";
  if (!NAME_PATTERN.test(name)) return "Letters, spaces, apostrophes and hyphens only.";
  return "";
}

export function validateUsername(value: string) {
  const username = value.trim();
  // Optional — an account can go without a handle.
  if (!username) return "";
  if (username.length < 3) return "Use at least 3 characters.";
  if (username.length > 20) return "Keep it under 20 characters.";
  if (!USERNAME_PATTERN.test(username)) return "Start with a letter; letters, numbers, . and _ only.";
  return "";
}

export function validateEmail(value: string) {
  const email = value.trim();
  if (!email) return "Email is required.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address, e.g. you@example.com.";
  return "";
}

/** Every field at once — what Save runs before it sends anything. */
export function validatePersonalDetails(values: PersonalDetailsValues): PersonalDetailsErrors {
  const errors: PersonalDetailsErrors = {
    name: validateName(values.name),
    username: validateUsername(values.username),
    email: validateEmail(values.email),
  };
  (Object.keys(errors) as (keyof PersonalDetailsValues)[]).forEach((key) => {
    if (!errors[key]) delete errors[key];
  });
  return errors;
}
