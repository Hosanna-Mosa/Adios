import * as Haptics from "expo-haptics";
import { useCallback } from "react";

import { useDriverStore } from "@/store/driverStore";
import { patchOnboarding } from "../onboardingApi";
import type { DocumentFields } from "./useDocumentFields";

export function useVerifyBank(docs: DocumentFields, setSaving: (v: boolean) => void) {
  return useCallback(async () => {
    const { bankAccount, bankConfirm, ifsc } = docs;
    if (bankAccount.length < 9 || bankAccount !== bankConfirm || ifsc.length < 8) return;

    setSaving(true);
    try {
      const token = useDriverStore.getState().token;
      if (token) {
        await patchOnboarding(token, {
          bankAccountNumber: bankAccount,
          bankIfsc: ifsc,
          bankVerified: true,
        });
      }
      docs.setBankVerified(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Dummy verify always succeeds
    } finally {
      setSaving(false);
    }
  }, [docs, setSaving]);
}
