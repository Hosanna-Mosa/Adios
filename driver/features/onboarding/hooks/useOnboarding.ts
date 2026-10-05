import { useCallback, useState } from "react";

import {
  getDigilockerSubtitle,
  getFormalitySubtitles,
  getSectionSubtitles,
  getSectionTitles,
  type OnboardingSectionKey,
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

/** Everything the onboarding screen and its sections need, in one object.
 *
 * With `onlySections` it drives the re-upload screen instead: just the
 * documents an admin asked for, then straight back for review. */
export function useOnboarding(options: { onlySections?: OnboardingSectionKey[] } = {}) {
  const [saving, setSaving] = useState(false);

  const step1 = useStep1Fields();
  const identity = useIdentityFields();
  const docs = useDocumentFields();

  useOnboardingHydrate(step1, identity, docs);

  const nav = useOnboardingNav(identity.aadhaarVerified, identity.panVerified, options.onlySections);
  const gates = useOnboardingGates(step1, identity, docs, nav.currentKey);
  // Verifying one ID normally drops the other section, shifting the cursor
  // back; the re-upload screen keeps every requested section, so it mustn't.
  const keepSectionIdx = useCallback((_fn: (p: number) => number) => {}, []);
  const { handleVerifyPAN, handleVerifyAadhaar } = useVerifyIdentity(
    identity,
    setSaving,
    options.onlySections ? keepSectionIdx : nav.setSectionIdx,
  );
  const handleVerifyBank = useVerifyBank(docs, setSaving);
  const { saveCurrentSectionData, handleCompleteOnboarding } = useOnboardingSave(
    step1,
    identity,
    docs,
    nav.currentKey,
    setSaving,
  );

  const sectionTitle = nav.currentKey ? getSectionTitles()[nav.currentKey] : "";
  const formality =
    (nav.currentKey === "aadhaar" && identity.panVerified) ||
    (nav.currentKey === "pan" && identity.aadhaarVerified);
  // Read from government records — nothing for the driver to type.
  const fromDigilocker =
    ((nav.currentKey === "aadhaar" || nav.currentKey === "pan") && identity.digilockerVerified) ||
    (nav.currentKey === "license" && docs.dlVerified);
  const sectionSubtitle = !nav.currentKey
    ? undefined
    : fromDigilocker
      ? getDigilockerSubtitle()
      : (formality && getFormalitySubtitles()[nav.currentKey]) || getSectionSubtitles()[nav.currentKey];

  return {
    saving, setSaving,
    step1, identity, docs,
    ...nav,
    ...gates,
    handleVerifyPAN, handleVerifyAadhaar, handleVerifyBank,
    saveCurrentSectionData, handleCompleteOnboarding,
    sectionTitle, sectionSubtitle,
    isReupload: Boolean(options.onlySections),
  };
}
