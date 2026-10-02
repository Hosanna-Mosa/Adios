import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback } from "react";

import { useDriverStore } from "@/store/driverStore";
import { trackEvent } from "@/utils/analytics";
import {
  bailIfUnauthorized,
  patchOnboarding,
  postHomeAddress,
  postOnboarding,
} from "../onboardingApi";
import type { OnboardingSectionKey } from "../onboardingSections";
import type { DocumentFields } from "./useDocumentFields";
import type { IdentityFields } from "./useIdentityFields";
import type { Step1Fields } from "./useStep1Fields";

/** Maps the section currently on screen to the PATCH body it saves. */
function payloadFor(
  sec: OnboardingSectionKey,
  step1: Step1Fields,
  identity: IdentityFields,
  docs: DocumentFields,
): Record<string, any> | null {
  switch (sec) {
    case "gender":
      return { gender: step1.gender };
    case "vehicle":
      return { vehicleType: step1.vehicle };
    case "zone":
      return { preferredZone: step1.preferredZone };
    case "aadhaar":
      return {
        aadhaarNumber: identity.aadhaarNumber.replace(/\s/g, ""),
        aadhaarVerified: identity.aadhaarVerified,
      };
    case "pan":
      return {
        panNumber: identity.panNumber,
        panName: identity.panName,
        panVerified: identity.panVerified,
      };
    case "license":
      return { dlNumber: docs.dlNumber, dlExpiry: docs.dlExpiry };
    case "bank":
      return {
        bankAccountNumber: docs.bankAccount,
        bankIfsc: docs.ifsc,
        bankVerified: docs.bankVerified,
      };
    default:
      return null;
  }
}

export function useOnboardingSave(
  step1: Step1Fields,
  identity: IdentityFields,
  docs: DocumentFields,
  currentKey: OnboardingSectionKey | undefined,
  setSaving: (v: boolean) => void,
) {
  const setOnboardingCompleted = useDriverStore((s) => s.setOnboardingCompleted);

  const saveCurrentSectionData = useCallback(async () => {
    const token = useDriverStore.getState().token;
    if (!token || !currentKey) return;

    setSaving(true);
    try {
      if (currentKey === "homeAddress") {
        const res = await postHomeAddress(
          token,
          step1.homeAddressLine,
          step1.homeLat,
          step1.homeLng,
        );
        bailIfUnauthorized(res.status);
        return;
      }

      const data = payloadFor(currentKey, step1, identity, docs);
      if (!data) return;
      const res = await patchOnboarding(token, data);
      bailIfUnauthorized(res.status);
    } catch (err) {
      console.error("Failed to save onboarding section:", currentKey, err);
    } finally {
      setSaving(false);
    }
  }, [currentKey, step1, identity, docs, setSaving]);

  const handleCompleteOnboarding = useCallback(async () => {
    const token = useDriverStore.getState().token;
    if (!token) return;

    setSaving(true);
    try {
      // selfieUri is the real Cloudinary URL from handleCaptureSelfie, not the
      // placeholder "captured" string this used to send.
      const patchRes = await patchOnboarding(token, { selfieImage: docs.selfieUri || undefined });
      if (bailIfUnauthorized(patchRes.status)) return;

      const res = await postOnboarding(token, "complete");
      if (bailIfUnauthorized(res.status)) return;
      if (!res.ok) {
        const errText = await res.text();
        console.error("Backend error response:", res.status, errText);
        throw new Error(`Failed to complete onboarding: ${res.status} ${errText}`);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      trackEvent("onboarding_completed");
      setOnboardingCompleted();
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Failed to complete onboarding:", err);
    } finally {
      setSaving(false);
    }
  }, [docs.selfieUri, setSaving, setOnboardingCompleted]);

  return { saveCurrentSectionData, handleCompleteOnboarding };
}
