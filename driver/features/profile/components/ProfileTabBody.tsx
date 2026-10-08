import React from "react";
import { useTranslation } from "react-i18next";

import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import i18n from "@/i18n";
import { fadeInUp } from "@/motion/presets";
import { formatAcceptanceRate, formatMonthYear } from "../utils/format";
import type { Status } from "../types";
import { styles } from "../profile-tab.styles";
import { AccountMenuList } from "./AccountMenuList";
import { CurrentVehicleRow } from "./CurrentVehicleRow";
import { DocumentStatusCard } from "./DocumentStatusCard";
import { ProfileHeaderCard } from "./ProfileHeaderCard";
import { ProfileStatsCard } from "./ProfileStatsCard";
import { RetakeOnboardingButton, SignOutButton } from "./ProfileActions";
import { AppText } from "@/components/ui/AppText";
import { useDriverStore } from "@/store/driverStore";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

/** Pill text and colours for a document's status as the profile reports it. */
function documentStatus(status: Status | undefined) {
  if (status === "valid") {
    return { status: i18n.t("profile.valid"), tone: Colors.success, toneSurface: Colors.successLight };
  }
  if (status === "expired") {
    return { status: i18n.t("profile.expired"), tone: Colors.error, toneSurface: Colors.errorLight };
  }
  return { status: i18n.t("profile.pending"), tone: Colors.warning, toneSurface: Colors.warningLight };
}

/** Everything on the profile tab above the section sheet. */
export function ProfileTabBody({
  profile,
  initials,
  sections,
  onOpenSection,
  onLogout,
  onRetakeOnboarding,
}: any) {
  const { t } = useTranslation();
  const isOnline = useDriverStore((s) => s.isOnline);
  return (
    <>
            <ProfileHeaderCard
              name={profile.account.name}
              initials={initials}
              profilePic={profile.account.profilePic}
              memberSince={formatMonthYear(profile.account.createdAt)}
              rating={profile.stats.rating}
            />

            <ProfileStatsCard
              stats={[
                { value: String(profile.stats.completedTrips), label: t("earnings.trips") },
                // Null until the backend has offers to compute it from — never "null%".
                { value: formatAcceptanceRate(profile.stats.acceptanceRate), label: t("profile.acceptance") },
                // Was comparing profile.driver?.status (backend enum "ONLINE"/"OFFLINE")
                // against the lowercase literal "online", which never matched — so this
                // read OFFLINE even while the driver was online. Reading the live
                // isOnline flag from the store also keeps this in sync immediately
                // after toggling shift status, instead of only after a manual refresh.
                { value: isOnline ? t("profile.online") : t("profile.offline"), label: t("profile.status") },
              ]}
            />

            {/* Statuses come from the profile; these were a fixed "Expired" licence
                and "Valid" insurance for every driver. */}
            <AnimatedBox entering={fadeInUp(120)} style={styles.docsRow}>
              <DocumentStatusCard
                icon="file-text"
                title={t("profile.drivingLicense")}
                {...documentStatus(profile.verification?.drivingLicense)}
              />
              <DocumentStatusCard
                icon="shield"
                title={t("profile.vehicleInsurance")}
                {...documentStatus(profile.vehicle?.insuranceStatus)}
              />
            </AnimatedBox>

            {/* The profile has no vehicle number, so only the type is shown (it used
                to append a made-up "*********4567"). */}
            <CurrentVehicleRow
              label={t("profile.currentVehicle")}
              detail={profile.vehicle.label}
              onPress={() => onOpenSection("vehicle")}
            />

            <AppText style={styles.sectionHeader}>{t("profile.account")}</AppText>

            <AccountMenuList
              entries={sections}
              onSelect={(item) => {
                if (item.key === "support") {
                  router.push("/support");
                } else if (item.key === "address") {
                  router.push("/saved-addresses");
                } else if (item.key === "notifications") {
                  router.push("/notifications");
                } else if (item.key === "language") {
                  router.push("/language-settings");
                } else {
                  onOpenSection(item.key);
                }
              }}
            />

            <SignOutButton onPress={onLogout} />

            <RetakeOnboardingButton
              onPress={onRetakeOnboarding}
            />
    </>
  );
}
