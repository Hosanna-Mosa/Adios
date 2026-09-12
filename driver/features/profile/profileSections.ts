import { useMemo } from "react";
import {
  available,
  field,
  formatCoordinates,
  formatDate,
  formatMonthYear,
  yesNo,
} from "./utils/format";

/** Turns the profile response into the list of sections the tab shows, each
 * with its own set of label/value rows. Pure assembly, no rendering. */
export function useProfileSections(profile: any) {
  const sections = useMemo(() => {
    if (!profile) return [];
    const driver = profile.driver;

    return [
      {
        key: "personal",
        icon: "user" as const,
        title: "Personal Info",
        subtitle: profile.account.phone,
        fields: [
          field("Name", profile.account.name),
          field("Username", profile.account.username),
          field("Email", profile.account.email),
          field("Phone", profile.account.phone),
          field("Gender", driver?.gender),
          field("Member Since", formatMonthYear(profile.account.createdAt)),
        ],
      },
      {
        key: "documents",
        icon: "file-text" as const,
        title: "Document Center",
        subtitle: profile.verification.documentsComplete
          ? "All required documents complete"
          : "Some documents are pending",
        fields: [
          field("Onboarding Status", driver?.onboardingStatus),
          field("Aadhaar", driver?.aadhaarNumber),
          field("Aadhaar Verified", yesNo(driver?.aadhaarVerified)),
          field("PAN", driver?.panNumber),
          field("Driving License", driver?.dlNumber),
          field("DL Expiry", formatDate(driver?.dlExpiry)),
          field("DL Status", profile.verification.drivingLicense),
          field("Selfie", available(driver?.selfieImage)),
        ],
      },
      {
        key: "vehicle",
        icon: "truck" as const,
        title: "Vehicle Details",
        subtitle: profile.vehicle.label,
        fields: [
          field("Vehicle Type", profile.vehicle.label),
          field("Insurance Status", profile.vehicle.insuranceStatus),
          field("Driver Status", driver?.status),
        ],
      },
      {
        key: "bank",
        icon: "credit-card" as const,
        title: "Payout Settings",
        subtitle: profile.verification.bank
          ? "Bank account ready for cash out"
          : "Add a bank account for payouts",
        fields: [
          field("Bank Account", driver?.bankAccountNumber),
          field("IFSC", driver?.bankIfsc),
          field("Bank Verified", yesNo(driver?.bankVerified)),
        ],
      },
      {
        key: "address",
        icon: "map-pin" as const,
        title: "Saved Addresses",
        subtitle: `${profile.account.addresses?.length || 0} saved addresses`,
        fields: [],
      },
      {
        key: "notifications",
        icon: "bell" as const,
        title: "Notifications",
        subtitle: "Jobs, chat, payouts and account updates",
        fields: [],
      },
      {
        key: "settings",
        icon: "settings" as const,
        title: "Settings",
        subtitle: "Account preferences",
        fields: [
          field("Default Location", formatCoordinates(profile.account.defaultLocation?.coordinates)),
          field("Saved Addresses", String(profile.account.addresses.length)),
          field("Member Since", formatDate(profile.account.createdAt)),
        ],
      },
      {
        key: "support",
        icon: "message-circle" as const,
        title: "Support",
        subtitle: "Get help with your account",
        fields: [
          field("Phone", profile.account.phone),
          field("Email", profile.account.email || "Not added"),
          field("Completed Trips", String(profile.stats.completedTrips)),
        ],
      },
    ];
  }, [profile]);


  return sections;
}
