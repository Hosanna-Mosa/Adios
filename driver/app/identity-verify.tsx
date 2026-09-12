import { router } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingTopBar, SectionHeader, IdentitySection, SectionProgressBar } from "@/features/onboarding/components";

import { styles } from "./identity-verify.styles";
import { useIdentityVerify } from "@/features/onboarding/hooks/useIdentityVerify";
import { IdentityBottomButton } from "@/features/onboarding/components";


// ═══════════════════════════════════════════════════════════════════════════════
//  IDENTITY VERIFICATION SCREEN (Standalone — only Aadhaar / PAN)
// ═══════════════════════════════════════════════════════════════════════════════

export default function IdentityVerifyScreen() {
  const insets = useSafeAreaInsets();

  // Section tracking
  const {
    scrollRef, slideAnimatedStyle,
    sectionIdx, saving,
    aadhaarNumber, setAadhaarNumber, aadhaarVerified, consentAadhaar, setConsentAadhaar,
    panNumber, setPanNumber, panName, setPanName, panVerified, consentPAN, setConsentPAN,
    validateAadhaarFormat, validatePANFormat,
    visibleSections, totalSections, currentKey,
    goNext, goPrev, handleVerifyAadhaar, handleVerifyPAN,
    canProceedSection, canProceedAadhaar, canProceedPAN, sectionSubtitle,
  } = useIdentityVerify();

  // ── Bottom button logic ──────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 16 }]}>
        <OnboardingTopBar
          canGoBack={sectionIdx > 0}
          onBack={goPrev}
          onSkip={() => router.back()}
        />

        {/* Progress */}
        <SectionProgressBar sections={visibleSections} currentIndex={sectionIdx} />

        {/* Section Title */}
        <SectionHeader
          title={visibleSections[sectionIdx]?.title || ""}
          subtitle={sectionSubtitle()}
        />

        {/* Content */}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={slideAnimatedStyle}>
            <IdentitySection
              currentKey={currentKey}
              saving={saving}
              aadhaarNumber={aadhaarNumber}
              setAadhaarNumber={setAadhaarNumber}
              aadhaarVerified={aadhaarVerified}
              consentAadhaar={consentAadhaar}
              setConsentAadhaar={setConsentAadhaar}
              panNumber={panNumber}
              setPanNumber={setPanNumber}
              panName={panName}
              setPanName={setPanName}
              panVerified={panVerified}
              consentPAN={consentPAN}
              setConsentPAN={setConsentPAN}
              validateAadhaarFormat={validateAadhaarFormat}
              validatePANFormat={validatePANFormat}
              handleVerifyAadhaar={handleVerifyAadhaar}
              handleVerifyPAN={handleVerifyPAN}
              goNext={goNext}
              goPrev={goPrev}
            />
          </Animated.View>
        </ScrollView>

        {/* Bottom Bar */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <IdentityBottomButton
            currentKey={currentKey}
            sectionIdx={sectionIdx}
            visibleSections={visibleSections}
            aadhaarVerified={aadhaarVerified}
            panVerified={panVerified}
            canProceedSection={canProceedSection}
            canProceedAadhaar={canProceedAadhaar}
            canProceedPAN={canProceedPAN}
            goNext={goNext}
            totalSections={totalSections}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

