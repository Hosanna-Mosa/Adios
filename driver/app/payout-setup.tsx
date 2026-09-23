import React, { useState } from "react";
import { Alert, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { useDriverStore } from "@/store/driverStore";
import {
  BankAccountForm,
  SaveBar,
  SecureNotice,
} from "@/features/onboarding/components";
import { styles } from "@/features/onboarding/payout-setup.styles";
import { API_URL } from "@/utils/apiUrl";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { KeyboardView } from "@/components/ui/KeyboardView";

export default function PayoutSetupScreen() {
  const { t: translate } = useTranslation();
  const insets = useSafeAreaInsets();
  const token = useDriverStore((s) => s.token);
  const params = useLocalSearchParams<{
    account?: string;
    ifsc?: string;
  }>();

  const [accountNumber, setAccountNumber] = useState(params.account || "");
  const [confirmAccount, setConfirmAccount] = useState("");
  const [ifsc, setIfsc] = useState(params.ifsc || "");
  const [saving, setSaving] = useState(false);

  const accountsMatch = accountNumber === confirmAccount;
  const canSave =
    accountNumber.length >= 9 &&
    accountsMatch &&
    ifsc.length >= 8 &&
    !saving;

  const handleSave = async () => {
    if (!canSave) return;

    if (!token) {
      Alert.alert(translate("auth.sessionExpired"), translate("auth.pleaseSignInAgain"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/onboarding`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bankAccountNumber: accountNumber,
          bankIfsc: ifsc,
          bankVerified: true,
        }),
      });

      if (res.status === 401 || res.status === 403) {
        useDriverStore.getState().logout();
        router.replace("/auth");
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || translate("earnings.failedToSaveBankDetails"));
      }

      Alert.alert(translate("earnings.bankDetailsSaved"), translate("earnings.payoutAccountSetUpCanCashOut"), [
        { text: translate("actions.ok"), onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert(translate("auth.errorTitle"), error.message || translate("earnings.couldNotSaveBankDetails"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScreenHeader
          title={translate("earnings.payoutSetup")}
          paddingTop={insets.top + 16}
          onBack={() => router.back()}
        />

        <ScrollBox
          style={styles.flex}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
          keyboardShouldPersistTaps="handled"
        >
          <SecureNotice
            title={translate("onboarding.securePayoutSetup")}
            text={translate("earnings.addAccountEarningsSettledMakeSureCorrect")}
          />

          <BankAccountForm
            accountNumber={accountNumber}
            onAccountNumberChange={(t) => setAccountNumber(t.replace(/[^0-9]/g, "").slice(0, 18))}
            confirmAccount={confirmAccount}
            onConfirmAccountChange={(t) => setConfirmAccount(t.replace(/[^0-9]/g, "").slice(0, 18))}
            accountsMatch={accountsMatch}
            ifsc={ifsc}
            onIfscChange={(t) => setIfsc(t.toUpperCase().slice(0, 11))}
          />
        </ScrollBox>

        <SaveBar
          label={translate("earnings.saveBankDetails")}
          onPress={handleSave}
          disabled={!canSave}
          saving={saving}
          paddingBottom={Math.max(insets.bottom, 12)}
        />
      </KeyboardView>
    </SafeAreaView>
  );
}
