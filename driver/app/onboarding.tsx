import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDriverStore } from "@/store/driverStore";
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

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const setOnboardingCompleted = useDriverStore((s) => s.setOnboardingCompleted);
  const onboarding = useOnboarding();
  const {
    step, sectionIdx, currentSections, currentKey, scrollRef, slideAnimatedStyle,
    sectionTitle, sectionSubtitle, docs, goToPrevSection, goToPrevStep,
  } = onboarding;

  const handleSkip = () => {
    setOnboardingCompleted();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)");
  };

  return (
    <OnboardingProvider value={onboarding}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.inner, { paddingTop: insets.top + 16 }]}>
          <OnboardingTopBar
            canGoBack={sectionIdx > 0 || step > 1}
            onBack={sectionIdx > 0 ? goToPrevSection : goToPrevStep}
            onSkip={handleSkip}
          />

          <StepIndicator step={step} />
          <SectionProgressBar sections={currentSections} currentIndex={sectionIdx} />
          <SectionHeader title={sectionTitle} subtitle={sectionSubtitle} />

          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 32 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={slideAnimatedStyle}>
              <OnboardingSection />
            </Animated.View>
          </ScrollView>

          <View
            style={[
              styles.bottomBar,
              { paddingBottom: Math.max(insets.bottom, 12) },
              currentKey === "bank" && !docs.bankVerified && styles.bottomBarHidden,
            ]}
          >
            <OnboardingBottomButton />
          </View>
        </View>
      </KeyboardAvoidingView>
    </OnboardingProvider>
  );
}
