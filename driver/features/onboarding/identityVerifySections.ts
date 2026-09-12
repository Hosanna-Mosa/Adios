/** The two identity steps, in the order they are shown. */
export type SectionKey = "aadhaar" | "pan";

export const SECTIONS: { key: SectionKey; label: string; title: string; subtitle: string }[] = [
  {
    key: "aadhaar",
    label: "Aadhaar",
    title: "Aadhaar Verification",
    subtitle: "Enter your 12-digit Aadhaar number to verify your identity.",
  },
  {
    key: "pan",
    label: "PAN Card",
    title: "PAN Card Details",
    subtitle: "Enter your PAN details for identity verification.",
  },
];
