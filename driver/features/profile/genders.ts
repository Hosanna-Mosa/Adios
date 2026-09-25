import i18n from "@/i18n";

/** Gender options in the profile edit form. */
export function getGenders() {
  return [
    { id: "male", label: i18n.t("onboarding.male"), icon: "user" as const },
    { id: "female", label: i18n.t("onboarding.female"), icon: "user" as const },
  ];
}
