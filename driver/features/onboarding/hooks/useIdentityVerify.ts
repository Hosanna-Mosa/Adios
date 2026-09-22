import React, { useRef, useState } from "react";

import { Dimensions, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useSharedValue, useAnimatedStyle, withSpring, interpolate } from "react-native-reanimated";
import { getIdentityVerifySections } from "../identityVerifySections";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
import { SPRING } from "@/motion/presets";
import { useIdentityVerifyActions } from "./useIdentityVerifyActions";

/** Aadhaar and PAN verification: the two-step flow, the API calls, and which
 * step is visible once one ID has been verified.
 *
 * Lifted out of app/identity-verify.tsx unchanged. */
export function useIdentityVerify() {
  const { t, i18n: i18nInstance } = useTranslation();

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
    let sections = getIdentityVerifySections();
    if (aadhaarVerified) {
      sections = sections.filter((s) => s.key !== "pan");
    } else if (panVerified) {
      sections = sections.filter((s) => s.key !== "aadhaar");
    }
    return sections;
  }, [aadhaarVerified, panVerified, i18nInstance.language]);

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
        ? t("onboarding.formalitySubtitles.aadhaar")
        : t("onboarding.sectionSubtitles.aadhaar");
    }
    if (currentKey === "pan") {
      return aadhaarVerified
        ? t("onboarding.formalitySubtitles.pan")
        : t("onboarding.sectionSubtitles.pan");
    }
    return "";
  };

  // ── Render section content ───────────────────────────────────────────────────

  const { handleVerifyAadhaar, handleVerifyPAN } = useIdentityVerifyActions({
    aadhaarNumber, panNumber, panName,
    validatePANFormat, setAadhaarVerified, setPanVerified, setSectionIdx, setSaving,
    panVerified, aadhaarVerified,
  });

  return {
    scrollRef, slideAnimatedStyle,
    sectionIdx, setSectionIdx, saving,
    aadhaarNumber, setAadhaarNumber, aadhaarVerified, consentAadhaar, setConsentAadhaar,
    panNumber, setPanNumber, panName, setPanName, panVerified, consentPAN, setConsentPAN,
    validateAadhaarFormat, validatePANFormat,
    visibleSections, totalSections, currentKey,
    goNext, goPrev, handleVerifyAadhaar, handleVerifyPAN,
    canProceedSection, canProceedAadhaar, canProceedPAN, sectionSubtitle,
  };
}
