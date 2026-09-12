import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
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


export default function PayoutSetupScreen() {
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
      Alert.alert("Session expired", "Please sign in again.");
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
        throw new Error(errData.message || "Failed to save bank details");
      }

      Alert.alert("Bank details saved", "Your payout account has been set up. You can now cash out your earnings.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Could not save bank details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScreenHeader
          title="Payout Setup"
          paddingTop={insets.top + 16}
          onBack={() => router.back()}
        />

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
          keyboardShouldPersistTaps="handled"
        >
          <SecureNotice
            title="Secure payout setup"
            text="Add the account where your delivery earnings should be settled. Make sure the details are correct."
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
        </ScrollView>

        <SaveBar
          label="Save Bank Details"
          onPress={handleSave}
          disabled={!canSave}
          saving={saving}
          paddingBottom={Math.max(insets.bottom, 12)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
