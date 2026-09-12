import React from "react";
import { Text } from "react-native";
import Animated from "react-native-reanimated";
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

/** Everything on the profile tab above the section sheet. */
export function ProfileTabBody({
  profile,
  initials,
  sections,
  onOpenSection,
  onLogout,
  onRetakeOnboarding,
}: any) {
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
                { value: String(profile.stats.completedTrips), label: "Trips" },
                { value: `${profile.stats.acceptanceRate}%`, label: "Acceptance" },
                { value: profile.driver?.status === "online" ? "ONLINE" : "OFFLINE", label: "Status" },
              ]}
            />

            <Animated.View entering={fadeInUp(120)} style={styles.docsRow}>
              <DocumentStatusCard
                icon="file-text"
                title="Driving License"
                status="Expired"
                tone={Colors.error}
                toneSurface={Colors.errorLight}
              />
              <DocumentStatusCard
                icon="shield"
                title="Vehicle Insurance"
                status="Valid"
                tone={Colors.success}
                toneSurface={Colors.successLight}
              />
            </Animated.View>

            <CurrentVehicleRow
              label="Current Vehicle"
              detail={`${profile.vehicle.label} • *********4567`}
              onPress={() => onOpenSection("vehicle")}
            />

            <Text style={styles.sectionHeader}>Account</Text>

            <AccountMenuList
              entries={sections}
              onSelect={(item) => {
                if (item.key === "support") {
                  router.push("/support");
                } else if (item.key === "address") {
                  router.push("/saved-addresses");
                } else if (item.key === "notifications") {
                  router.push("/notifications");
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
