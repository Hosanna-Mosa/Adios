import React from "react";

import { LinearGradient } from "expo-linear-gradient";
import { gradients } from "@/constants/colors";
import { styles } from "../profile-tab.styles";
import { PressBox } from "@/components/ui/PressBox";
import { AppText } from "@/components/ui/AppText";

/** Gradient sign-out button. */
export function SignOutButton({ onPress }: { onPress: () => void }) {
  return (
    <PressBox style={styles.signOutButtonWrap} onPress={onPress}>
      <LinearGradient
        colors={gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.signOutGradient}
      >
        <AppText style={styles.signOutText}>Sign Out</AppText>
      </LinearGradient>
    </PressBox>
  );
}

/** Development shortcut that clears onboarding and restarts the flow. */
export function RetakeOnboardingButton({ onPress }: { onPress: () => void }) {
  return (
    <PressBox style={styles.devButton} onPress={onPress}>
      <AppText style={styles.devBadge}>DEV</AppText>
      <AppText style={styles.devButtonText}>Retake Onboarding</AppText>
    </PressBox>
  );
}
