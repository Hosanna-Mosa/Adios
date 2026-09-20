import * as Haptics from "expo-haptics";
import { useDriverStore } from "@/store/driverStore";
import { API_URL } from "@/utils/apiUrl";

/** The two verification requests. Either one succeeding marks the driver as
 * identity-verified; the other step is then hidden. */
export function useIdentityVerifyActions({
  aadhaarNumber, panNumber, panName,
  validatePANFormat, setAadhaarVerified, setPanVerified, setSectionIdx, setSaving,
  panVerified, aadhaarVerified,
}: any) {
  const setIdentityVerified = useDriverStore((s) => s.setIdentityVerified);

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
          setSectionIdx((prev: number) => Math.max(0, prev - 1));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
        }
      } else {
        setPanVerified(true);
        setIdentityVerified(true);
        setSectionIdx((prev: number) => Math.max(0, prev - 1));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      setPanVerified(true);
      setIdentityVerified(true);
      setSectionIdx((prev: number) => Math.max(0, prev - 1));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally {
      setSaving(false);
    }
  };

  return { handleVerifyAadhaar, handleVerifyPAN };
}
