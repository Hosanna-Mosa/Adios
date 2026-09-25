import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { SPRING } from "@/motion/presets";
import {
  getStep1Sections,
  getStep2Sections,
  type OnboardingSection,
} from "../onboardingSections";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export type OnboardingNav = ReturnType<typeof useOnboardingNav>;

/** Step / section cursor plus the slide animation that runs between them. */
export function useOnboardingNav(aadhaarVerified: boolean, panVerified: boolean) {
  const { i18n: i18nInstance } = useTranslation();
  const params = useLocalSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [sectionIdx, setSectionIdx] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const slideAnim = useSharedValue(0);

  const slideAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          slideAnim.value,
          [-1, 0, 1],
          [-SCREEN_WIDTH * 0.3, 0, SCREEN_WIDTH * 0.3],
        ),
      },
    ],
    opacity: interpolate(slideAnim.value, [-1, 0, 1], [0.3, 1, 0.3]),
  }));

  useEffect(() => {
    if (params.verify === "identity") {
      setStep(2);
      setSectionIdx(0);
    }
  }, [params.verify]);

  // Once one ID is verified the other section drops out of the flow.
  // Re-reads section labels whenever the language changes (i18nInstance.language
  // in the dependency array), since getStep1Sections()/getStep2Sections() read
  // the current language at call time and would otherwise stay stale.
  const currentSections: OnboardingSection[] = useMemo(() => {
    if (step === 1) return getStep1Sections();
    const step2 = getStep2Sections();
    if (aadhaarVerified) return step2.filter((s) => s.key !== "pan");
    if (panVerified) return step2.filter((s) => s.key !== "aadhaar");
    return step2;
  }, [step, aadhaarVerified, panVerified, i18nInstance.language]);

  const totalSections = currentSections.length;

  const animateTransition = useCallback(
    (direction: 1 | -1) => {
      slideAnim.value = direction;
      slideAnim.value = withSpring(0, SPRING);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    },
    [slideAnim],
  );

  const goToNextSection = useCallback(() => {
    if (sectionIdx < totalSections - 1) {
      setSectionIdx((p) => p + 1);
      animateTransition(1);
    }
  }, [sectionIdx, totalSections, animateTransition]);

  const goToPrevSection = useCallback(() => {
    if (sectionIdx > 0) {
      setSectionIdx((p) => p - 1);
      animateTransition(-1);
    }
  }, [sectionIdx, animateTransition]);

  const goToNextStep = useCallback(() => {
    if (step < 2) {
      setStep((p) => (p + 1) as 1 | 2);
      setSectionIdx(0);
      animateTransition(1);
    }
  }, [step, animateTransition]);

  const goToPrevStep = useCallback(() => {
    if (step > 1) {
      setStep((p) => (p - 1) as 1 | 2);
      setSectionIdx(getStep1Sections().length - 1);
      animateTransition(-1);
    }
  }, [step, animateTransition]);

  return {
    step, sectionIdx, setSectionIdx, scrollRef, slideAnimatedStyle,
    currentSections, totalSections, currentKey: currentSections[sectionIdx]?.key,
    nextSection: currentSections[sectionIdx + 1],
    goToNextSection, goToPrevSection, goToNextStep, goToPrevStep,
  };
}
