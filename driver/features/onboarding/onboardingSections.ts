import i18n from "@/i18n";

export type OnboardingSectionKey =
  | "gender"
  | "vehicle"
  | "zone"
  | "homeAddress"
  | "aadhaar"
  | "pan"
  | "license"
  | "bank"
  | "selfie";

export type OnboardingSection = { key: OnboardingSectionKey; label: string };

// Functions rather than static arrays/objects so labels can call i18n.t() and
// re-read the current language on every call — see useOnboarding.ts and
// useOnboardingNav.ts, which call these fresh each render.

export function getStep1Sections(): OnboardingSection[] {
  return [
    { key: "gender", label: i18n.t("onboarding.sections.gender", "Gender") },
    { key: "vehicle", label: i18n.t("onboarding.sections.vehicle", "Vehicle") },
    { key: "zone", label: i18n.t("onboarding.sections.preferredZone", "Preferred Zone") },
    { key: "homeAddress", label: i18n.t("onboarding.sections.homeAddress", "Home Address") },
  ];
}

export function getStep2Sections(): OnboardingSection[] {
  return [
    { key: "aadhaar", label: i18n.t("onboarding.sections.aadhaar", "Aadhaar") },
    { key: "pan", label: i18n.t("onboarding.sections.pan", "PAN") },
    { key: "license", label: i18n.t("onboarding.sections.license", "License") },
    { key: "bank", label: i18n.t("onboarding.sections.bank", "Bank") },
    { key: "selfie", label: i18n.t("onboarding.sections.selfie", "Selfie") },
  ];
}

export function getSectionTitles(): Record<OnboardingSectionKey, string> {
  return {
    gender: i18n.t("onboarding.sectionTitles.gender", "Select Your Gender"),
    vehicle: i18n.t("onboarding.sectionTitles.vehicle", "Select Your Vehicle"),
    zone: i18n.t("onboarding.sectionTitles.zone", "Select Preferred Zone"),
    homeAddress: i18n.t("onboarding.sectionTitles.homeAddress", "Enter Your Home Address"),
    aadhaar: i18n.t("onboarding.sectionTitles.aadhaar", "Aadhaar Verification"),
    pan: i18n.t("onboarding.sectionTitles.pan", "PAN Card Details"),
    license: i18n.t("onboarding.sectionTitles.license", "Driving License"),
    bank: i18n.t("onboarding.sectionTitles.bank", "Bank Account Details"),
    selfie: i18n.t("onboarding.sectionTitles.selfie", "Profile Photo"),
  };
}

export function getSectionSubtitles(): Record<OnboardingSectionKey, string> {
  return {
    gender: i18n.t("onboarding.sectionSubtitles.gender", "This helps us personalise your experience."),
    vehicle: i18n.t("onboarding.sectionSubtitles.vehicle", "Choose the vehicle you'll use for deliveries. You can change this later."),
    zone: i18n.t("onboarding.sectionSubtitles.zone", "Choose your preferred operational zone. This is where you will receive ride and delivery requests."),
    homeAddress: i18n.t("onboarding.sectionSubtitles.homeAddress", "This is used for the 'Head Home' matching feature, giving you orders on your way home."),
    aadhaar: i18n.t("onboarding.sectionSubtitles.aadhaar", "Enter your 12-digit Aadhaar number to verify your identity."),
    pan: i18n.t("onboarding.sectionSubtitles.pan", "Enter your PAN details for identity verification."),
    license: i18n.t("onboarding.sectionSubtitles.license", "Enter your driving license number and expiry date."),
    bank: i18n.t("onboarding.sectionSubtitles.bank", "Enter your bank details for seamless payouts."),
    selfie: i18n.t("onboarding.sectionSubtitles.selfie", "Take a clear selfie for your profile. No hats or glasses."),
  };
}

// Aadhaar / PAN / licence already read from DigiLocker — nothing to type.
export function getDigilockerSubtitle(): string {
  return i18n.t(
    "onboarding.digilockerVerifiedSubtitle",
    "Verified from your government records via DigiLocker.",
  );
}

// When the *other* ID has already been verified, the remaining one is collected
// for records only — the copy changes to say so.
export function getFormalitySubtitles(): Partial<Record<OnboardingSectionKey, string>> {
  return {
    aadhaar: i18n.t("onboarding.formalitySubtitles.aadhaar", "Aadhaar details collected for records (PAN was used for identity verification)."),
    pan: i18n.t("onboarding.formalitySubtitles.pan", "PAN details collected for records (Aadhaar was used for identity verification)."),
  };
}
