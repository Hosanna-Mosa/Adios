import { ScrollView } from "react-native";
import Animated from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/ui/Header";
import { AppTabBar } from "@/components/AppTabBar";
import { fadeInDown, fadeInUp } from "@/motion/presets";
import { ProfileSignOutAllBtn } from "@/features/profile/components/ProfileSignOutAllBtn";
import { ProfileDeleteAccountLink } from "@/features/profile/components/ProfileDeleteAccountLink";
import { ProfileSignOutBtn } from "@/features/profile/components/ProfileSignOutBtn";
import { ProfileMenuCard } from "@/features/profile/components/ProfileMenuCard";
import { ProfileStatsRow } from "@/features/profile/components/ProfileStatsRow";
import { ProfileCard } from "@/features/profile/components/ProfileCard";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { SecuritySheet } from "@/features/profile/components/SecuritySheet";
import { useProfile } from "@/features/profile/useProfile";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const {
  insets, tabBarHeight, user, theme, toggleTheme, tokens, accent, styles, loading,
  securityVisible, setSecurityVisible, currentPassword, setCurrentPassword,
  newPassword, setNewPassword, confirmPassword, setConfirmPassword, changingPassword,
  signingOutAll, handleAvatarPress, handleChangePassword, handleSignOutAllDevices, handleLogout,
  memberSinceYear, MENU_ITEMS
  } = useProfile();

  return (
    <ScreenShell>
      <Header
        title={t("tabs.account")}
        style={{ paddingTop: insets.top + 12 }}
        entering={fadeInDown(0)}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: tabBarHeight + 24 }} showsVerticalScrollIndicator={false}>
        <ProfileCard
          handleAvatarPress={handleAvatarPress}
          styles={styles}
          tokens={tokens}
          user={user}
        />

        <ProfileStatsRow
          memberSinceYear={memberSinceYear}
          styles={styles}
        />

        <ProfileMenuCard
          MENU_ITEMS={MENU_ITEMS}
          accent={accent}
          styles={styles}
          theme={theme}
          toggleTheme={toggleTheme}
          tokens={tokens}
        />

        <Animated.View entering={fadeInUp(280)}>
          <ProfileSignOutBtn
            handleLogout={handleLogout}
            loading={loading}
            styles={styles}
            tokens={tokens}
          />
          <ProfileSignOutAllBtn
            handleSignOutAllDevices={handleSignOutAllDevices}
            loading={loading}
            signingOutAll={signingOutAll}
            styles={styles}
            tokens={tokens}
          />
          <ProfileDeleteAccountLink styles={styles} disabled={signingOutAll || loading} />
        </Animated.View>
      </ScrollView>

      <AppTabBar active="account" />

      {/* Security modal */}
      <SecuritySheet
        changingPassword={changingPassword}
        confirmPassword={confirmPassword}
        currentPassword={currentPassword}
        handleChangePassword={handleChangePassword}
        insets={insets}
        newPassword={newPassword}
        securityVisible={securityVisible}
        setConfirmPassword={setConfirmPassword}
        setCurrentPassword={setCurrentPassword}
        setNewPassword={setNewPassword}
        setSecurityVisible={setSecurityVisible}
        styles={styles}
        tokens={tokens}
      />
    </ScreenShell>
  );
}
