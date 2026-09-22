import i18n from "@/i18n";

/** The two identity steps, in the order they are shown. */
export type SectionKey = "aadhaar" | "pan";

export function getIdentityVerifySections(): { key: SectionKey; label: string; title: string; subtitle: string }[] {
  return [
    {
      key: "aadhaar",
      label: i18n.t("onboarding.sections.aadhaar", "Aadhaar"),
      title: i18n.t("onboarding.sectionTitles.aadhaar", "Aadhaar Verification"),
      subtitle: i18n.t("onboarding.sectionSubtitles.aadhaar", "Enter your 12-digit Aadhaar number to verify your identity."),
    },
    {
      key: "pan",
      label: i18n.t("onboarding.sections.panCard", "PAN Card"),
      title: i18n.t("onboarding.sectionTitles.pan", "PAN Card Details"),
      subtitle: i18n.t("onboarding.sectionSubtitles.pan", "Enter your PAN details for identity verification."),
    },
  ];
}
