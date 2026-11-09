import React, { useState } from "react";
import { Alert, Platform } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDriverStore } from "@/store/driverStore";
import { API_URL } from "@/utils/apiUrl";
import { styles } from "@/features/profile/profile.styles";
import { DeleteAccountBody, ProfilePageHeader } from "@/features/profile/components";
import { ScrollBox } from "@/components/ui/ScrollBox";

// Self-service account deletion (Google Play requires one in the app). The server
// anonymises the account: personal and KYC details removed, sessions ended, trips,
// earnings and payouts kept for tax. Codes it answers with, mapped to messages.
const ERROR_KEYS: Record<string, string> = {
  PASSWORD_INCORRECT: "profile.deleteAccount.passwordIncorrect",
  ACTIVE_ORDER: "profile.deleteAccount.activeOrder",
  PAYOUT_PENDING: "profile.deleteAccount.payoutPending",
};

export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const logout = useDriverStore((s) => s.logout);

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const runDelete = async () => {
    setDeleting(true);
    try {
      const token = useDriverStore.getState().token;
      const res = await fetch(`${API_URL}/users/me/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const key = ERROR_KEYS[data?.code];
        setError(key ? t(key) : data?.message || t("profile.deleteAccount.failed"));
        setDeleting(false);
        return;
      }
    } catch {
      setError(t("profile.deleteAccount.failed"));
      setDeleting(false);
      return;
    }
    // The server already ended every session; this clears the device.
    logout();
    setDeleting(false);
    router.replace("/auth");
    Alert.alert(t("profile.deleteAccount.doneTitle"), t("profile.deleteAccount.doneBody"));
  };

  const confirmDelete = () => {
    if (!password) {
      setError(t("profile.deleteAccount.passwordRequired"));
      return;
    }
    Alert.alert(t("profile.deleteAccount.confirmTitle"), t("profile.deleteAccount.confirmBody"), [
      { text: t("actions.cancel"), style: "cancel" },
      { text: t("profile.deleteAccount.confirmButton"), style: "destructive", onPress: runDelete },
    ]);
  };

  return (
    <ScrollBox
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
          paddingBottom: insets.bottom + 40,
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <ProfilePageHeader title={t("profile.deleteAccount.title")} onClose={() => router.back()} />
      <DeleteAccountBody
        password={password}
        onChangePassword={(value) => {
          setPassword(value);
          setError(null);
        }}
        error={error}
        deleting={deleting}
        onDelete={confirmDelete}
      />
    </ScrollBox>
  );
}
