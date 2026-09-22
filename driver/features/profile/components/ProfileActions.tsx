import React from "react";
import { useTranslation } from "react-i18next";

import { LinearGradient } from "expo-linear-gradient";
import { gradients } from "@/constants/colors";
import { styles } from "../profile-tab.styles";
import { PressBox } from "@/components/ui/PressBox";
import { AppText } from "@/components/ui/AppText";

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
