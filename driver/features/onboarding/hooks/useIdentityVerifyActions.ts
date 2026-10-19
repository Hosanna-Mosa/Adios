import * as Haptics from "expo-haptics";
import { Alert } from "react-native";
import i18n from "@/i18n";
import { useDriverStore } from "@/store/driverStore";
import { API_URL } from "@/utils/apiUrl";

/** POSTs one identity check. Only the server's `verified: true` counts as a pass. */
async function requestVerification(path: string, body: Record<string, string>): Promise<{ verified: boolean; message?: string }> {
  const token = useDriverStore.getState().token;
  if (!token) return { verified: false, message: i18n.t("onboarding.signInAgainToVerify") };
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const result = await res.json().catch(() => ({}));
  return { verified: res.ok && result?.verified === true, message: result?.message };
}

/** The two verification requests. Either one succeeding marks the driver as
 * identity-verified; the other step is then hidden.
 *
 * Fails closed: no session, a network error or any answer other than the
 * server's `verified: true` leaves the step unverified. (A missing token or a
 * failed request used to count as a pass.) */
export function useIdentityVerifyActions({
  aadhaarNumber, panNumber, panName,
  validatePANFormat, setAadhaarVerified, setPanVerified, setSectionIdx, setSaving,
}: any) {
  const setIdentityVerified = useDriverStore((s) => s.setIdentityVerified);

  const fail = (message?: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert(i18n.t("onboarding.verificationFailed"), message || i18n.t("onboarding.verificationFailedTryAgain"));
  };

  const handleVerifyAadhaar = async () => {
    const cleaned = aadhaarNumber.replace(/\s/g, "");
    if (cleaned.length !== 12) return;

    setSaving(true);
    try {
      const { verified, message } = await requestVerification("/onboarding/verify-aadhaar", { aadhaarNumber: cleaned });
      if (!verified) return fail(message);
      setAadhaarVerified(true);
      setIdentityVerified(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      fail();
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
      const { verified, message } = await requestVerification("/onboarding/verify-pan", { panNumber: cleanedPan, panName });
      if (!verified) return fail(message);
      setPanVerified(true);
      setIdentityVerified(true);
      // Adjust section index — Aadhaar gets filtered out, PAN shifts from idx=1 to idx=0
      setSectionIdx((prev: number) => Math.max(0, prev - 1));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      fail();
    } finally {
      setSaving(false);
    }
  };

  return { handleVerifyAadhaar, handleVerifyPAN };
}
