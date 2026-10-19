import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { Alert } from "react-native";

import i18n from "@/i18n";
import { useDriverStore } from "@/store/driverStore";
import { patchOnboarding } from "../onboardingApi";
import type { DocumentFields } from "./useDocumentFields";

/**
 * Saves the payout bank account. The app no longer marks it verified: only the
 * Adios team can (admin → driver → Verify bank), and cash-out waits for that.
 * `docs.bankVerified` here means "saved", which is what lets onboarding move on.
 */
export function useVerifyBank(docs: DocumentFields, setSaving: (v: boolean) => void) {
  return useCallback(async () => {
    const { bankAccount, bankConfirm, ifsc } = docs;
    if (bankAccount.length < 9 || bankAccount !== bankConfirm || ifsc.length < 8) return;

    const token = useDriverStore.getState().token;
    if (!token) {
      Alert.alert(i18n.t("earnings.failedToSaveBankDetails"), i18n.t("onboarding.signInAgainToVerify"));
      return;
    }

    setSaving(true);
    try {
      const res = await patchOnboarding(token, { bankAccountNumber: bankAccount, bankIfsc: ifsc });
      if (!res.ok) throw new Error();
      docs.setBankVerified(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(i18n.t("earnings.failedToSaveBankDetails"), i18n.t("earnings.couldNotSaveBankDetails"));
    } finally {
      setSaving(false);
    }
  }, [docs, setSaving]);
}
