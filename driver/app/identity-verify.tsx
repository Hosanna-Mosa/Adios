import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDriverStore } from "@/store/driverStore";
import {
  ConsentCheckbox,
  FormInput,
  InfoBanner,
  PrimaryButton,
  AlternateIdLink,
  OnboardingTopBar,
  SectionHeader,
  ValidationErrorBox,
} from "@/features/onboarding/components";

import { SPRING } from "@/motion/presets";
import { progressStyles, styles } from "./identity-verify.styles";
import { API_URL } from "@/utils/apiUrl";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Reusable UI Components ────────────────────────────────────────────────────

// ─── Section Progress Indicator ────────────────────────────────────────────────

function SectionProgress({ total, current }: { total: number; current: number }) {
  return (
    <View style={progressStyles.row}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            progressStyles.bar,
            i < current && progressStyles.barDone,
            i === current && progressStyles.barActive,
          ]}
        />
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  IDENTITY VERIFICATION SCREEN (Standalone — only Aadhaar / PAN)
// ═══════════════════════════════════════════════════════════════════════════════

type SectionKey = "aadhaar" | "pan";

const SECTIONS: { key: SectionKey; label: string; title: string; subtitle: string }[] = [
  {
    key: "aadhaar",
    label: "Aadhaar",
    title: "Aadhaar Verification",
    subtitle: "Enter your 12-digit Aadhaar number to verify your identity.",
  },
  {
    key: "pan",
    label: "PAN Card",
    title: "PAN Card Details",
    subtitle: "Enter your PAN details for identity verification.",
  },
];

export default function IdentityVerifyScreen() {
  const insets = useSafeAreaInsets();
  const setIdentityVerified = useDriverStore((s) => s.setIdentityVerified);

  // Section tracking
  const [sectionIdx, setSectionIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const slideAnim = useSharedValue(0);
  const slideAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(slideAnim.value, [-1, 0, 1], [-SCREEN_WIDTH * 0.3, 0, SCREEN_WIDTH * 0.3]) }],
    opacity: interpolate(slideAnim.value, [-1, 0, 1], [0.3, 1, 0.3]),
  }));

  // Aadhaar state
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [consentAadhaar, setConsentAadhaar] = useState(false);

  // PAN state
  const [panNumber, setPanNumber] = useState("");
  const [panName, setPanName] = useState("");
  const [panVerified, setPanVerified] = useState(false);
  const [consentPAN, setConsentPAN] = useState(false);

  // ── Validators ───────────────────────────────────────────────────────────────
  const validateAadhaarFormat = (num: string) => /^[2-9][0-9]{11}$/.test(num);
  const validatePANFormat = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);

  // ── Dynamic sections: once one ID is verified, remove the other ──────────────
  const visibleSections = React.useMemo(() => {
    let sections = [...SECTIONS];
    if (aadhaarVerified) {
      sections = sections.filter((s) => s.key !== "pan");
    } else if (panVerified) {
      sections = sections.filter((s) => s.key !== "aadhaar");
    }
    return sections;
  }, [aadhaarVerified, panVerified]);

  const totalSections = visibleSections.length;
  const currentKey = visibleSections[sectionIdx]?.key;

  // ── Animations ───────────────────────────────────────────────────────────────
  const animateTransition = (direction: 1 | -1) => {
    slideAnim.value = direction;
    slideAnim.value = withSpring(0, SPRING);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const goNext = () => {
    if (sectionIdx < totalSections - 1) {
      setSectionIdx((p) => p + 1);
      animateTransition(1);
    }
  };

  const goPrev = () => {
    if (sectionIdx > 0) {
      setSectionIdx((p) => p - 1);
      animateTransition(-1);
    }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleVerifyAadhaar = async () => {
    const cleaned = aadhaarNumber.replace(/\s/g, "");
    if (cleaned.length !== 12) return;

    setSaving(true);
    try {
      const token = useDriverStore.getState().token;
      if (token) {
        const res = await fetch(`${API_URL}/onboarding/verify-aadhaar`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ aadhaarNumber: cleaned }),
        });
        const result = await res.json();
        if (result.verified) {
          setAadhaarVerified(true);
          setIdentityVerified(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
        }
      } else {
        // Mock fallback
        setAadhaarVerified(true);
        setIdentityVerified(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      setAadhaarVerified(true);
      setIdentityVerified(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyPAN = async () => {
    const cleanedPan = panNumber.trim().toUpperCase();
    if (!validatePANFormat(cleanedPan) || panName.length < 3) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setSaving(true);
    try {
      const token = useDriverStore.getState().token;
      if (token) {
        const res = await fetch(`${API_URL}/onboarding/verify-pan`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ panNumber: cleanedPan, panName }),
        });
        const result = await res.json();
        if (result.verified) {
          setPanVerified(true);
          setIdentityVerified(true);
          // Adjust section index — Aadhaar gets filtered out, PAN shifts from idx=1 to idx=0
          setSectionIdx(prev => Math.max(0, prev - 1));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
        }
      } else {
        setPanVerified(true);
        setIdentityVerified(true);
        setSectionIdx(prev => Math.max(0, prev - 1));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      setPanVerified(true);
      setIdentityVerified(true);
      setSectionIdx(prev => Math.max(0, prev - 1));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally {
      setSaving(false);
    }
  };

  // ── Can-proceed checks ───────────────────────────────────────────────────────
  const canProceedAadhaar = (): boolean => {
    if (panVerified) {
      // Formality mode — PAN already verified, just collect Aadhaar for records
      return validateAadhaarFormat(aadhaarNumber.replace(/\s/g, ""));
    }
    return aadhaarVerified;
  };

  const canProceedPAN = (): boolean => {
    if (aadhaarVerified) {
      // Formality mode — Aadhaar already verified, just collect PAN for records
      return validatePANFormat(panNumber) && panName.length >= 3;
    }
    return panVerified;
  };

  const canProceedSection = (): boolean => {
    if (currentKey === "aadhaar") return canProceedAadhaar();
    if (currentKey === "pan") return canProceedPAN();
    return false;
  };

  // ── Section subtitle (context-aware) ─────────────────────────────────────────
  const sectionSubtitle = (): string => {
    if (currentKey === "aadhaar") {
      return panVerified
        ? "Aadhaar details collected for records (PAN was used for identity verification)."
        : "Enter your 12-digit Aadhaar number to verify your identity.";
    }
    if (currentKey === "pan") {
      return aadhaarVerified
        ? "PAN details collected for records (Aadhaar was used for identity verification)."
        : "Enter your PAN details for identity verification.";
    }
    return "";
  };

  // ── Render section content ───────────────────────────────────────────────────
  const renderSection = () => {
    if (currentKey === "aadhaar") {
      return (
        <View style={{ gap: 16 }}>
          <FormInput
            label="Aadhaar Number"
            value={aadhaarNumber}
            onChangeText={(t) => {
              const cleaned = t.replace(/[^0-9]/g, "").slice(0, 12);
              const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
              setAadhaarNumber(formatted);
            }}
            placeholder="XXXX XXXX XXXX"
            keyboardType="number-pad"
            maxLength={14}
            icon="credit-card"
          />

          {panVerified ? (
            /* ── Formality mode — PAN was already verified ── */
            <>
              <InfoBanner
                icon="info"
                text="Aadhaar details collected for records. PAN was used for identity verification."
                type="info"
              />
              {aadhaarNumber.replace(/\s/g, "").length > 0 &&
                (validateAadhaarFormat(aadhaarNumber.replace(/\s/g, "")) ? (
                  <InfoBanner icon="check-circle" text="Valid Aadhaar format" type="success" />
                ) : (
                  <ValidationErrorBox message="Invalid Aadhaar number. Must be 12 digits and cannot start with 0 or 1." />
                ))}
            </>
          ) : !aadhaarVerified ? (
            /* ── Verify mode ── */
            <>
              <ConsentCheckbox
                checked={consentAadhaar}
                onToggle={() => setConsentAadhaar(!consentAadhaar)}
                label="I consent to share my Aadhaar details with Triozen for identity verification via third-party services (Surepass)."
              />
              <PrimaryButton
                title="Verify Aadhaar"
                onPress={handleVerifyAadhaar}
                disabled={aadhaarNumber.replace(/\s/g, "").length < 12 || !consentAadhaar || saving}
                loading={saving}
                icon="shield"
              />
              {!panVerified && (
                <AlternateIdLink label="Use PAN Card instead →" onPress={goNext} />
              )}
            </>
          ) : (
            <InfoBanner icon="check-circle" text="Aadhaar verified successfully!" type="success" />
          )}
        </View>
      );
    }

    if (currentKey === "pan") {
      return (
        <View style={{ gap: 16 }}>
          <FormInput
            label="PAN Number"
            value={panNumber}
            onChangeText={(t) => setPanNumber(t.toUpperCase().slice(0, 10))}
            placeholder="ABCDE1234F"
            autoCapitalize="characters"
            icon="file-text"
          />
          <FormInput
            label="Name as on PAN Card"
            value={panName}
            onChangeText={setPanName}
            placeholder="Enter full name"
            autoCapitalize="words"
            icon="user"
          />

          {aadhaarVerified ? (
            /* ── Formality mode — Aadhaar was already verified ── */
            <>
              <InfoBanner
                icon="info"
                text="PAN details collected for records. Aadhaar was used for identity verification."
                type="info"
              />
              {panNumber.length > 0 && !validatePANFormat(panNumber) && (
                <ValidationErrorBox message="Invalid PAN number. Format should be 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)." />
              )}
              {panName.length > 0 && panName.length < 3 && (
                <ValidationErrorBox message="Name must be at least 3 characters." />
              )}
              {validatePANFormat(panNumber) && panName.length >= 3 && (
                <InfoBanner icon="check-circle" text="Valid PAN details" type="success" />
              )}
            </>
          ) : !panVerified ? (
            /* ── Verify mode ── */
            <>
              <ConsentCheckbox
                checked={consentPAN}
                onToggle={() => setConsentPAN(!consentPAN)}
                label="I consent to share my PAN details with Triozen for identity verification via third-party services (Surepass)."
              />
              <PrimaryButton
                title="Verify PAN"
                onPress={handleVerifyPAN}
                disabled={panNumber.length < 10 || panName.length < 3 || !consentPAN || saving}
                loading={saving}
                icon="shield"
              />
              {!aadhaarVerified && (
                <AlternateIdLink label="← Use Aadhaar instead" onPress={goPrev} />
              )}
            </>
          ) : (
            <InfoBanner icon="check-circle" text="PAN verified successfully!" type="success" />
          )}
        </View>
      );
    }

    return null;
  };

  // ── Bottom button logic ──────────────────────────────────────────────────────
  const renderBottomButton = () => {
    const oneVerified = aadhaarVerified || panVerified;

    if (oneVerified && totalSections === 1) {
      // Only one section left (the other was already verified and filtered out)
      // or both are on the same section — user is done
      if (currentKey === "aadhaar" && panVerified && !canProceedAadhaar()) {
        return <View />;
      }
      if (currentKey === "pan" && aadhaarVerified && !canProceedPAN()) {
        return <View />;
      }
      // If the formality-mode fields are valid, show Done
      if (canProceedSection()) {
        return (
          <PrimaryButton
            title="Done"
            onPress={() => router.back()}
            icon="check"
          />
        );
      }
      return <View />;
    }

    if (currentKey === "aadhaar" && aadhaarVerified) {
      return (
        <PrimaryButton
          title={`Next — ${visibleSections[sectionIdx + 1]?.label || "PAN Card"}`}
          onPress={goNext}
          icon="arrow-right"
        />
      );
    }

    if (currentKey === "pan" && panVerified) {
      return (
        <PrimaryButton
          title="Done"
          onPress={() => router.back()}
          icon="check"
        />
      );
    }

    if (currentKey === "aadhaar" && canProceedAadhaar() && panVerified) {
      // Formality mode: Aadhaar fields filled, PAN already verified → show Done
      return (
        <PrimaryButton
          title="Done"
          onPress={() => router.back()}
          icon="check"
        />
      );
    }

    if (currentKey === "pan" && canProceedPAN() && aadhaarVerified) {
      // Formality mode: PAN fields filled, Aadhaar already verified → show Done
      return (
        <PrimaryButton
          title="Done"
          onPress={() => router.back()}
          icon="check"
        />
      );
    }

    // Default: hide bottom bar for verify-mode sections (inline verify button handles it)
    return <View />;
  };

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
        <SectionProgress total={totalSections} current={sectionIdx} />

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
            {renderSection()}
          </Animated.View>
        </ScrollView>

        {/* Bottom Bar */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          {renderBottomButton()}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
