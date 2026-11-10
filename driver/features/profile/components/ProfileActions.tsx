import React from "react";
import { useTranslation } from "react-i18next";

import { LinearGradient } from "expo-linear-gradient";
import { gradients } from "@/constants/colors";
import { styles } from "../profile-tab.styles";
import { PressBox } from "@/components/ui/PressBox";
import { AppText } from "@/components/ui/AppText";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";

/** Gradient sign-out button. */
export function SignOutButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <PressBox style={styles.signOutButtonWrap} onPress={onPress}>
      <LinearGradient
        colors={gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.signOutGradient}
      >
        <AppText style={styles.signOutText}>{t("profile.signOut")}</AppText>
      </LinearGradient>
    </PressBox>
  );
}

/** Quiet link under "Sign out" to the account-deletion screen. */
export function DeleteAccountLink() {
  const { t } = useTranslation();
  return (
    <PressBox style={styles.deleteAccountLink} onPress={() => router.push("/delete-account")}>
      <AppText style={styles.deleteAccountLinkText}>{t("profile.deleteAccount.title")}</AppText>
    </PressBox>
  );
}

/**
 * Link to the published privacy policy (EXPO_PUBLIC_PRIVACY_POLICY_URL).
 * Hidden until that is set, rather than opening a dead page.
 */
export function PrivacyPolicyLink() {
  const { t } = useTranslation();
  const url = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL;
  if (!url) return null;
  return (
    <PressBox style={styles.deleteAccountLink} onPress={() => void WebBrowser.openBrowserAsync(url).catch(() => {})}>
      <AppText style={styles.deleteAccountLinkText}>{t("profile.privacyPolicy")}</AppText>
    </PressBox>
  );
}

/** Development shortcut that clears onboarding and restarts the flow. */
export function RetakeOnboardingButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <PressBox style={styles.devButton} onPress={onPress}>
      <AppText style={styles.devBadge}>DEV</AppText>
      <AppText style={styles.devButtonText}>{t("profile.retakeOnboarding")}</AppText>
    </PressBox>
  );
}
