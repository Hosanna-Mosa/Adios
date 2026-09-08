import React from "react";
import { Pressable, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradients } from "@/constants/colors";
import { styles } from "../profile-tab.styles";

/** Gradient sign-out button. */
export function SignOutButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.signOutButtonWrap} onPress={onPress}>
      <LinearGradient
        colors={gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.signOutGradient}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </LinearGradient>
    </Pressable>
  );
}

/** Development shortcut that clears onboarding and restarts the flow. */
export function RetakeOnboardingButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.devButton} onPress={onPress}>
      <Text style={styles.devBadge}>DEV</Text>
      <Text style={styles.devButtonText}>Retake Onboarding</Text>
    </Pressable>
  );
}
