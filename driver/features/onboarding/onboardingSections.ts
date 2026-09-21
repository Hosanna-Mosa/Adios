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

export const STEP1_SECTIONS: OnboardingSection[] = [
  { key: "gender", label: "Gender" },
  { key: "vehicle", label: "Vehicle" },
  { key: "zone", label: "Preferred Zone" },
  { key: "homeAddress", label: "Home Address" },
];

export const STEP2_SECTIONS: OnboardingSection[] = [
  { key: "aadhaar", label: "Aadhaar" },
  { key: "pan", label: "PAN" },
  { key: "license", label: "License" },
  { key: "bank", label: "Bank" },
  { key: "selfie", label: "Selfie" },
];

export const SECTION_TITLES: Record<OnboardingSectionKey, string> = {
  gender: "Select Your Gender",
  vehicle: "Select Your Vehicle",
  zone: "Select Preferred Zone",
  homeAddress: "Enter Your Home Address",
  aadhaar: "Aadhaar Verification",
  pan: "PAN Card Details",
  license: "Driving License",
  bank: "Bank Account Details",
  selfie: "Profile Photo",
};

export const SECTION_SUBTITLES: Record<OnboardingSectionKey, string> = {
  gender: "This helps us personalise your experience.",
  vehicle: "Choose the vehicle you'll use for deliveries. You can change this later.",
  zone: "Choose your preferred operational zone. This is where you will receive ride and delivery requests.",
  homeAddress: "This is used for the 'Head Home' matching feature, giving you orders on your way home.",
  aadhaar: "Enter your 12-digit Aadhaar number to verify your identity.",
  pan: "Enter your PAN details for identity verification.",
  license: "Enter your driving license number and expiry date.",
  bank: "Enter your bank details for seamless payouts.",
  selfie: "Take a clear selfie for your profile. No hats or glasses.",
};

// When the *other* ID has already been verified, the remaining one is collected
// for records only — the copy changes to say so.
export const FORMALITY_SUBTITLES: Partial<Record<OnboardingSectionKey, string>> = {
  aadhaar: "Aadhaar details collected for records (PAN was used for identity verification).",
  pan: "PAN details collected for records (Aadhaar was used for identity verification).",
};
