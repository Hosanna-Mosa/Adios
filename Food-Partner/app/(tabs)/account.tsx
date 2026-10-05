import { useTranslation } from "react-i18next";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ScreenTitle } from "@/components/ui/ScreenTitle";
import { BusinessSection } from "@/features/account/components/BusinessSection";
import { HelpSection } from "@/features/account/components/HelpSection";
import { PreferencesSection } from "@/features/account/components/PreferencesSection";
import { ProfileCard } from "@/features/account/components/ProfileCard";
import { SignOutSection } from "@/features/account/components/SignOutSection";
import { useAccount } from "@/features/account/useAccount";

export default function AccountScreen() {
  const { t } = useTranslation();
  const { insets, tabBarHeight, tokens, styles, profile, isMeat, isDark, toggleTheme, languageName, confirmSignOut, version } = useAccount();

  return (
    <ScreenShell scroll contentStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: tabBarHeight }]}>
      <ScreenTitle title={t("account.title")} style={styles.title} />
      <ProfileCard
        name={profile?.name ?? ""}
        image={profile?.image}
        address={profile?.address}
        email={profile?.email}
        phone={profile?.phone}
        isMeat={isMeat}
      />
      <BusinessSection isMeat={isMeat} tokens={tokens} />
      <PreferencesSection isDark={isDark} toggleTheme={toggleTheme} languageName={languageName} tokens={tokens} />
      <HelpSection tokens={tokens} />
      <SignOutSection onSignOut={confirmSignOut} version={version} styles={styles} />
    </ScreenShell>
  );
}
