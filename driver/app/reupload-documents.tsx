import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";
import { Box } from "@/components/ui/Box";
import { KeyboardView } from "@/components/ui/KeyboardView";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { Colors } from "@/constants/colors";
import { OnboardingProvider } from "@/features/onboarding/OnboardingContext";
import {
  OnboardingBottomButton,
  OnboardingSection,
  OnboardingTopBar,
  SectionHeader,
  SectionProgressBar,
} from "@/features/onboarding/components";
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";
import { styles } from "@/features/onboarding/onboarding.styles";
import type { OnboardingSectionKey } from "@/features/onboarding/onboardingSections";
import { useDriverStore } from "@/store/driverStore";

/**
 * Re-upload only the documents an admin asked for (Driver Verification →
 * "Request documents"), then send the application straight back for review.
 * Same section components as onboarding, limited to the requested ones.
 */
export default function ReuploadDocumentsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const review = useDriverStore((s) => s.verificationReview);
  const driverEmail = useDriverStore((s) => s.driverEmail);
  // Fixed for the screen's lifetime so the section list doesn't shift under the driver.
  const [requested] = React.useState<OnboardingSectionKey[]>(
    () => (review?.requestedDocuments || []) as OnboardingSectionKey[],
  );
  // Submitting needs an email (review outcomes are emailed); drivers from
  // before it was mandatory add one here first.
  const [sections] = React.useState<OnboardingSectionKey[]>(() =>
    requested.length && !driverEmail ? ["email", ...requested] : requested,
  );

  const onboarding = useOnboarding({ onlySections: sections });
  const {
    sectionIdx, currentSections, currentKey, scrollRef, slideAnimatedStyle,
    sectionTitle, sectionSubtitle, docs, goToPrevSection,
  } = onboarding;

  // Nothing was asked for (or the request was withdrawn) — nothing to do here.
  if (requested.length === 0) {
    return (
      <Box style={[styles.container, { paddingTop: insets.top + 48, paddingHorizontal: 24 }]}>
        <AppText size="medium" color={Colors.textSecondary} style={{ textAlign: "center" }}>
          {t("verification.nothingRequested", "No documents have been requested. Go back and tap Check status to refresh.")}
        </AppText>
      </Box>
    );
  }

  return (
    <OnboardingProvider value={onboarding}>
      <KeyboardView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Box style={[styles.inner, { paddingTop: insets.top + 16 }]}>
          <OnboardingTopBar
            canGoBack
            onBack={sectionIdx > 0 ? goToPrevSection : () => router.back()}
          />

          {review?.note ? (
            <Box
              style={{
                backgroundColor: Colors.warningLight,
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <AppText size="small" weight="bold" color={Colors.warning}>
                {t("verification.noteFromTeam", "Note from our team")}
              </AppText>
              <AppText size="medium" color={Colors.text}>
                {review.note}
              </AppText>
            </Box>
          ) : null}

          <SectionProgressBar sections={currentSections} currentIndex={sectionIdx} />
          <SectionHeader title={sectionTitle} subtitle={sectionSubtitle} />

          <ScrollBox
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
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
