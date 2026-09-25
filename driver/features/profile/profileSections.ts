import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const sections = useMemo(() => {
    if (!profile) return [];
    const driver = profile.driver;

    return [
      {
        key: "personal",
        icon: "user" as const,
        title: t("profile.personalInfo"),
        subtitle: profile.account.phone,
        fields: [
          field(t("profile.name"), profile.account.name),
          field(t("profile.username"), profile.account.username),
          field(t("profile.email"), profile.account.email),
          field(t("profile.phone"), profile.account.phone),
          field(t("onboarding.sections.gender"), driver?.gender),
          field(t("profile.memberSince"), formatMonthYear(profile.account.createdAt)),
        ],
      },
      {
        key: "documents",
        icon: "file-text" as const,
        title: t("profile.documentCenter"),
        subtitle: profile.verification.documentsComplete
          ? t("profile.allRequiredDocumentsComplete")
          : t("profile.someDocumentsArePending"),
        fields: [
          field(t("profile.onboardingStatus"), driver?.onboardingStatus),
          field(t("onboarding.sections.aadhaar"), driver?.aadhaarNumber),
          field(t("profile.aadhaarVerified"), yesNo(driver?.aadhaarVerified)),
          field(t("onboarding.sections.pan"), driver?.panNumber),
          field(t("profile.drivingLicense"), driver?.dlNumber),
          field(t("profile.dlExpiry"), formatDate(driver?.dlExpiry)),
          field(t("profile.dlStatus"), profile.verification.drivingLicense),
          field(t("onboarding.sections.selfie"), available(driver?.selfieImage)),
        ],
      },
      {
        key: "vehicle",
        icon: "truck" as const,
        title: t("profile.vehicleDetails"),
        subtitle: profile.vehicle.label,
        fields: [
          field(t("profile.vehicleType"), profile.vehicle.label),
          field(t("profile.insuranceStatus"), profile.vehicle.insuranceStatus),
          field(t("profile.driverStatus"), driver?.status),
        ],
      },
      {
        key: "bank",
        icon: "credit-card" as const,
        title: t("profile.payoutSettings"),
        subtitle: profile.verification.bank
          ? t("profile.bankAccountReadyForCashOut")
          : t("profile.addABankAccountForPayouts"),
        fields: [
          field(t("profile.bankAccount"), driver?.bankAccountNumber),
          field(t("profile.ifsc"), driver?.bankIfsc),
          field(t("profile.bankVerified"), yesNo(driver?.bankVerified)),
        ],
      },
      {
        key: "address",
        icon: "map-pin" as const,
        title: t("profile.savedAddresses"),
        subtitle: t("profile.xSavedAddresses", { value: profile.account.addresses?.length || 0, defaultValue: "{{value}} saved addresses" }),
        fields: [],
      },
      {
        key: "notifications",
        icon: "bell" as const,
        title: t("profile.notifications"),
        subtitle: t("profile.jobsChatPayoutsAndAccountUpdates"),
        fields: [],
      },
      {
        key: "language",
        icon: "globe" as const,
        title: t("language.language"),
        subtitle: t("profile.changeAppLanguage"),
        fields: [],
      },
      {
        key: "settings",
        icon: "settings" as const,
        title: t("profile.settings"),
        subtitle: t("profile.accountPreferences"),
        fields: [
          field(t("profile.defaultLocation"), formatCoordinates(profile.account.defaultLocation?.coordinates)),
          field(t("profile.savedAddresses"), String(profile.account.addresses.length)),
          field(t("profile.memberSince"), formatDate(profile.account.createdAt)),
        ],
      },
      {
        key: "support",
        icon: "message-circle" as const,
        title: t("support.partnerSupport", "Support"),
        subtitle: t("profile.getHelpWithYourAccount"),
        fields: [
          field(t("profile.phone"), profile.account.phone),
          field(t("profile.email"), profile.account.email || t("profile.notAdded")),
          field(t("profile.completedTrips"), String(profile.stats.completedTrips)),
        ],
      },
    ];
  }, [profile, t]);


  return sections;
}
