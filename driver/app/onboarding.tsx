import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const onboarding = useOnboarding();
  const {
    step, sectionIdx, currentSections, currentKey, scrollRef, slideAnimatedStyle,
    sectionTitle, sectionSubtitle, docs, goToPrevSection, goToPrevStep,
    isLastSection, goToNextSection, goToNextStep,
  } = onboarding;

  // Skip moves past this one section without saving it. It used to mark the whole
  // of onboarding done and open the tabs, so the application never reached an
  // admin; now the driver still submits at the end and still needs approval
  // (the admin can ask for anything skipped). Not shown on the last section
  // (the selfie), which is where the driver submits.
  const canSkip = !(step === 2 && isLastSection);
  const handleSkip = () => {
    trackEvent("onboarding_skipped", { step, section: currentKey ?? "" });
    if (isLastSection) goToNextStep();
    else goToNextSection();
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
            onSkip={canSkip ? handleSkip : undefined}
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
