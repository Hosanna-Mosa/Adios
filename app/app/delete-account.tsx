import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { showAlert } from "@/components/ui/AppAlert";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useAuthStore } from "@/contexts/authStore";
import { useLanguageStore } from "@/contexts/languageStore";
import { fadeInDown } from "@/motion/presets";
import { DeleteAccountBody } from "@/features/profile/components/DeleteAccountBody";
import { deleteAccount } from "@/services/users.service";

// Self-service account deletion (Google Play requires one in the app). The server
// anonymises the account: details removed, sessions ended, orders kept for tax.
// Codes the server answers with, mapped to translated messages.
const ERROR_KEYS: Record<string, string> = {
  PASSWORD_INCORRECT: "app.deleteAccount.passwordIncorrect",
  ACTIVE_ORDER: "app.deleteAccount.activeOrder",
};

export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const runDelete = async () => {
    try {
      setDeleting(true);
      await deleteAccount(password);
    } catch (err: any) {
      const key = ERROR_KEYS[err?.data?.code];
      setError(key ? t(key) : err?.message || t("app.ride.pleaseTryAgain"));
      setDeleting(false);
      return;
    }
    // The server already ended every session; this clears the device.
    await logout();
    useLanguageStore.getState().resetLanguageGate();
    setDeleting(false);
    router.replace("/select-language");
    showAlert(t("app.deleteAccount.doneTitle"), t("app.deleteAccount.doneBody"));
  };

  const confirmDelete = () => {
    if (!password) {
      setError(t("app.deleteAccount.passwordRequired"));
      return;
    }
    showAlert(t("app.deleteAccount.confirmTitle"), t("app.deleteAccount.confirmBody"), [
      { text: t("actions.cancel"), style: "cancel" },
      { text: t("app.deleteAccount.confirmButton"), style: "destructive", onPress: runDelete },
    ]);
  };

  return (
    <ScreenShell style={{ paddingTop: insets.top }}>
      <Header
        title={t("app.deleteAccount.title")}
        onBack={() => router.back()}
        style={{ paddingTop: 12, paddingBottom: 12 }}
        entering={fadeInDown(0)}
      />
      <DeleteAccountBody
        tokens={tokens}
        insets={insets}
        password={password}
        onChangePassword={(value) => {
          setPassword(value);
          setError(null);
        }}
        error={error}
        deleting={deleting}
        onDelete={confirmDelete}
      />
    </ScreenShell>
  );
}
