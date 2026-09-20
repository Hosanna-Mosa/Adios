import { useState } from "react";

import {
  FORMALITY_SUBTITLES,
  SECTION_SUBTITLES,
  SECTION_TITLES,
} from "../onboardingSections";
import { useDocumentFields } from "./useDocumentFields";
import { useIdentityFields } from "./useIdentityFields";
import { useOnboardingGates } from "./useOnboardingGates";
import { useOnboardingHydrate } from "./useOnboardingHydrate";
import { useOnboardingNav } from "./useOnboardingNav";
import { useOnboardingSave } from "./useOnboardingSave";
import { useStep1Fields } from "./useStep1Fields";
import { useVerifyBank } from "./useVerifyBank";
import { useVerifyIdentity } from "./useVerifyIdentity";

export type OnboardingController = ReturnType<typeof useOnboarding>;

/** Everything the onboarding screen and its sections need, in one object. */
export function useOnboarding() {
  const [saving, setSaving] = useState(false);

  const step1 = useStep1Fields();
  const identity = useIdentityFields();
  const docs = useDocumentFields();

  useOnboardingHydrate(step1, identity, docs);

  const nav = useOnboardingNav(identity.aadhaarVerified, identity.panVerified);
  const gates = useOnboardingGates(step1, identity, docs, nav.currentKey);
  const { handleVerifyPAN, handleVerifyAadhaar } = useVerifyIdentity(
    identity,
    setSaving,
    nav.setSectionIdx,
  );
  const handleVerifyBank = useVerifyBank(docs, setSaving);
  const { saveCurrentSectionData, handleCompleteOnboarding } = useOnboardingSave(
    step1,
    identity,
    docs,
    nav.currentKey,
    setSaving,
  );

  const sectionTitle = nav.currentKey ? SECTION_TITLES[nav.currentKey] : "";
  const formality =
    (nav.currentKey === "aadhaar" && identity.panVerified) ||
    (nav.currentKey === "pan" && identity.aadhaarVerified);
  const sectionSubtitle = nav.currentKey
    ? (formality && FORMALITY_SUBTITLES[nav.currentKey]) || SECTION_SUBTITLES[nav.currentKey]
    : undefined;

  return {
    saving, setSaving,
    step1, identity, docs,
    ...nav,
    ...gates,
    handleVerifyPAN, handleVerifyAadhaar, handleVerifyBank,
    saveCurrentSectionData, handleCompleteOnboarding,
    sectionTitle, sectionSubtitle,
  };
}
