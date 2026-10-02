// Field rules for app/personal-details.tsx. The screen used to PATCH whatever
// was typed and only surfaced a problem when the server rejected it — an empty
// name, a one-character name and "abc" as an email all reached the API.
//
// Each rule returns the message to show under the field, or "" when it passes.

import i18n from "@/i18n";

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
  if (!name) return i18n.t("app.personaldetails.fullNameRequired");
  if (name.length < 3) return i18n.t("app.personaldetails.useAtLeast3Characters");
  if (name.length > 50) return i18n.t("app.personaldetails.keepItUnder50Characters");
  if (!NAME_PATTERN.test(name)) return i18n.t("app.personaldetails.nameAllowedCharacters");
  return "";
}

export function validateUsername(value: string) {
  const username = value.trim();
  // Optional — an account can go without a handle.
  if (!username) return "";
  if (username.length < 3) return i18n.t("app.personaldetails.useAtLeast3Characters");
  if (username.length > 20) return i18n.t("app.personaldetails.keepItUnder20Characters");
  if (!USERNAME_PATTERN.test(username)) return i18n.t("app.personaldetails.usernameAllowedCharacters");
  return "";
}

export function validateEmail(value: string) {
  const email = value.trim();
  if (!email) return i18n.t("app.personaldetails.emailRequired");
  if (!EMAIL_PATTERN.test(email)) return i18n.t("app.personaldetails.enterAValidEmailAddress");
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
