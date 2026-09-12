
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { Colors } from "@/constants/colors";
import { DriverTabBar, useDriverTabBarHeight } from "@/components/shared/DriverTabBar";
import { useDriverStore } from "@/store/driverStore";

import { ProfileLoadingCard, ProfileSectionModal, ProfileUnavailableCard } from "@/features/profile/components";
import { SectionContent } from "@/features/profile/components/sections";
import { styles } from "@/features/profile/profile-tab.styles";
import { useProfileSections } from "@/features/profile/profileSections";
import { useProfileTab } from "@/features/profile/hooks/useProfileTab";
import { GENDERS } from "@/features/profile/genders";
import { ProfileTabBody } from "@/features/profile/components";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { Refresh } from "@/components/ui/Refresh";

// ─── GENDER OPTIONS ───────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
//  PROFILE SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

export default function ProfileScreen() {
  const tabBarHeight = useDriverTabBarHeight();
  const resetOnboarding = useDriverStore((s) => s.resetOnboarding);
  const tab = useProfileTab();
  const {
    profile, isLoading, isRefreshing, loadProfile, initials,
    activeSection, setActiveSection,
  } = tab;
  const handleLogout = tab.handleLogout;

  const sections = useProfileSections(profile);
  const selectedSection = sections.find((section) => section.key === activeSection);

  // Closing the sheet also abandons whichever form was open inside it.
  const handleCloseModal = () => {
    setActiveSection(null);
    tab.setIsEditing(false);
    tab.setShowPasswordForm(false);
    tab.setShowBankForm(false);
    tab.setNewBankAccount("");
    tab.setNewBankIfsc("");
  };

  // ── Render modal content by section ──────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <LinearGradient
        colors={[Colors.brandSkin, Colors.background]}
        style={styles.headerGradient}
      />
      <ScrollBox
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight }]}
        refreshControl={<Refresh refreshing={isRefreshing} onRefresh={() => loadProfile(true)} />}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ProfileLoadingCard />
        ) : !profile ? (
          <ProfileUnavailableCard message="Profile data is not available." />
        ) : (
          <>
            <ProfileTabBody
              profile={profile}
              initials={initials}
              sections={sections}
              onOpenSection={setActiveSection}
              onLogout={handleLogout}
              onRetakeOnboarding={() => {
                resetOnboarding();
                router.replace("/onboarding");
              }}
            />
          </>
        )}
      </ScrollBox>

      <DriverTabBar active="profile" />

      <ProfileSectionModal
        visible={Boolean(selectedSection)}
        title={selectedSection?.title}
        onClose={handleCloseModal}
      >
        <SectionContent
          {...tab}
          selectedSection={selectedSection}
          GENDERS={GENDERS}
          handleCloseModal={handleCloseModal}
        />
      </ProfileSectionModal>
    </SafeAreaView>
  );
}
