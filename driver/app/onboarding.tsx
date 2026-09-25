import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDriverStore } from "@/store/driverStore";
import { trackEvent } from "@/utils/analytics";
import { OnboardingProvider } from "@/features/onboarding/OnboardingContext";
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";
import { styles } from "@/features/onboarding/onboarding.styles";
import {
  OnboardingBottomButton,
  OnboardingSection,
  OnboardingTopBar,
  SectionHeader,
  SectionProgressBar,
  StepIndicator,
} from "@/features/onboarding/components";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { KeyboardView } from "@/components/ui/KeyboardView";
import { Box } from "@/components/ui/Box";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const setOnboardingCompleted = useDriverStore((s) => s.setOnboardingCompleted);
  const onboarding = useOnboarding();
  const {
    step, sectionIdx, currentSections, currentKey, scrollRef, slideAnimatedStyle,
    sectionTitle, sectionSubtitle, docs, goToPrevSection, goToPrevStep,
  } = onboarding;

  const handleSkip = () => {
    trackEvent("onboarding_skipped", { step });
    setOnboardingCompleted();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)");
  };

  return (
    <OnboardingProvider value={onboarding}>
      <KeyboardView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Box style={[styles.inner, { paddingTop: insets.top + 16 }]}>
          <OnboardingTopBar
            canGoBack={sectionIdx > 0 || step > 1}
            onBack={sectionIdx > 0 ? goToPrevSection : goToPrevStep}
            onSkip={handleSkip}
          />

          <StepIndicator step={step} />
          <SectionProgressBar sections={currentSections} currentIndex={sectionIdx} />
          <SectionHeader title={sectionTitle} subtitle={sectionSubtitle} />

          <ScrollBox
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 32 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AnimatedBox style={slideAnimatedStyle}>
              <OnboardingSection />
            </AnimatedBox>
          </ScrollBox>

          <Box
            style={[
              styles.bottomBar,
              { paddingBottom: Math.max(insets.bottom, 12) },
              currentKey === "bank" && !docs.bankVerified && styles.bottomBarHidden,
            ]}
          >
            <OnboardingBottomButton />
          </Box>
        </Box>
      </KeyboardView>
    </OnboardingProvider>
  );
}
