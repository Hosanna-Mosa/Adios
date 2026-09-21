import * as Haptics from "expo-haptics";
import { useCallback } from "react";

import { useDriverStore } from "@/store/driverStore";
import { postOnboarding } from "../onboardingApi";
import { validatePANFormat } from "../validators";
import type { IdentityFields } from "./useIdentityFields";

const warn = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
const ok = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
const bad = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

/** Aadhaar / PAN verification against Surepass, with a local-success fallback. */
export function useVerifyIdentity(
  identity: IdentityFields,
  setSaving: (v: boolean) => void,
  setSectionIdx: (fn: (p: number) => number) => void,
) {
  const setIdentityVerified = useDriverStore((s) => s.setIdentityVerified);

  const acceptPAN = useCallback(() => {
    identity.setPanVerified(true);
    setIdentityVerified(true);
    // The Aadhaar section gets filtered out → PAN shifts from idx=1 to idx=0.
    setSectionIdx((prev) => Math.max(0, prev - 1));
    ok();
  }, [identity, setIdentityVerified, setSectionIdx]);

  const acceptAadhaar = useCallback(() => {
    identity.setAadhaarVerified(true);
    setIdentityVerified(true);
    ok();
  }, [identity, setIdentityVerified]);

  const handleVerifyPAN = useCallback(async () => {
    const cleanedPan = identity.panNumber.trim().toUpperCase();
    if (!validatePANFormat(cleanedPan) || identity.panName.length < 3 || !identity.consentPAN) {
      warn();
      return;
    }

    setSaving(true);
    try {
      const token = useDriverStore.getState().token;
      if (!token) {
        acceptPAN();
        return;
      }
      const res = await postOnboarding(token, "verify-pan", {
        panNumber: cleanedPan,
        panName: identity.panName,
      });
      const result = await res.json();
      if (result.verified) acceptPAN();
      else bad();
    } catch {
      acceptPAN();
    } finally {
      setSaving(false);
    }
  }, [identity, setSaving, acceptPAN]);

  const handleVerifyAadhaar = useCallback(async () => {
    const cleaned = identity.aadhaarNumber.replace(/\s/g, "");
    if (cleaned.length !== 12) return;

    setSaving(true);
    try {
      const token = useDriverStore.getState().token;
      if (!token) {
        acceptAadhaar();
        return;
      }
      const res = await postOnboarding(token, "verify-aadhaar", { aadhaarNumber: cleaned });
      const result = await res.json();
      if (result.verified) acceptAadhaar();
      else bad();
    } catch {
      acceptAadhaar();
    } finally {
      setSaving(false);
    }
  }, [identity, setSaving, acceptAadhaar]);

  return { handleVerifyPAN, handleVerifyAadhaar };
}
