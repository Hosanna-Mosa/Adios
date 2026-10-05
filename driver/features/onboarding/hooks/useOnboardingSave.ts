import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";

import i18n from "@/i18n";

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
    case "email":
      return { email: step1.email.trim().toLowerCase() };
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
  const setOnboardingStatus = useDriverStore((s) => s.setOnboardingStatus);

  /** Saves the section on screen. Resolves false only when the email step was
   * refused (invalid / already used), so the caller can stay on that step. */
  const saveCurrentSectionData = useCallback(async (): Promise<boolean> => {
    const token = useDriverStore.getState().token;
    if (!token || !currentKey) return true;

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
        return true;
      }

      const data = payloadFor(currentKey, step1, identity, docs);
      if (!data) return true;
      const res = await patchOnboarding(token, data);
      if (bailIfUnauthorized(res.status)) return false;

      // The email is mandatory (review outcomes are emailed), so a refused one
      // must be fixed here rather than discovered at the final submit.
      if (currentKey === "email" && !res.ok) {
        const body = await res.json().catch(() => ({}));
        Alert.alert(
          i18n.t("onboarding.emailNotSavedTitle", "Check your email"),
          body?.message || i18n.t("onboarding.emailNotSavedBody", "We couldn't save this email address. Please try again."),
        );
        return false;
      }
      return true;
    } catch (err) {
      console.error("Failed to save onboarding section:", currentKey, err);
      if (currentKey === "email") {
        Alert.alert(
          i18n.t("onboarding.emailNotSavedTitle", "Check your email"),
          i18n.t("onboarding.emailNotSavedBody", "We couldn't save this email address. Please try again."),
        );
        return false;
      }
      return true;
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
        // e.g. a resubmission still missing a document the admin asked for.
        let message = "";
        try {
          message = JSON.parse(errText)?.message || "";
        } catch {
          // Not JSON — keep the generic alert below.
        }
        Alert.alert(i18n.t("verification.submitFailedTitle", "Couldn't submit"), message || i18n.t("verification.submitFailedBody", "Please try again."));
        throw new Error(`Failed to complete onboarding: ${res.status} ${errText}`);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      trackEvent("onboarding_completed");

      // The application now waits for an admin; only an already-approved
      // driver goes straight back to work.
      const { onboardingStatus } = await res.json().catch(() => ({}));
      if (onboardingStatus === "completed") {
        setOnboardingCompleted();
        router.replace("/(tabs)");
      } else {
        setOnboardingStatus(onboardingStatus || "pending_approval");
        router.replace("/verification-status");
      }
    } catch (err: any) {
      console.error("Failed to complete onboarding:", err);
    } finally {
      setSaving(false);
    }
  }, [docs.selfieUri, setSaving, setOnboardingCompleted, setOnboardingStatus]);

  return { saveCurrentSectionData, handleCompleteOnboarding };
}
