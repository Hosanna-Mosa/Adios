import React from "react";
import { useTranslation } from "react-i18next";

import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { fadeInUp } from "@/motion/presets";
import { formatMonthYear } from "../utils/format";
import { styles } from "../profile-tab.styles";
import { AccountMenuList } from "./AccountMenuList";
import { CurrentVehicleRow } from "./CurrentVehicleRow";
import { DocumentStatusCard } from "./DocumentStatusCard";
import { ProfileHeaderCard } from "./ProfileHeaderCard";
import { ProfileStatsCard } from "./ProfileStatsCard";
import { RetakeOnboardingButton, SignOutButton } from "./ProfileActions";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

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
                { value: `${profile.stats.acceptanceRate}%`, label: t("profile.acceptance") },
                { value: profile.driver?.status === "online" ? t("profile.online") : t("profile.offline"), label: t("profile.status") },
              ]}
            />

            <AnimatedBox entering={fadeInUp(120)} style={styles.docsRow}>
              <DocumentStatusCard
                icon="file-text"
                title={t("profile.drivingLicense")}
                status={t("profile.expired")}
                tone={Colors.error}
                toneSurface={Colors.errorLight}
              />
              <DocumentStatusCard
                icon="shield"
                title={t("profile.vehicleInsurance")}
                status={t("profile.valid")}
                tone={Colors.success}
                toneSurface={Colors.successLight}
              />
            </AnimatedBox>

            <CurrentVehicleRow
              label={t("profile.currentVehicle")}
              detail={`${profile.vehicle.label} • *********4567`}
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
