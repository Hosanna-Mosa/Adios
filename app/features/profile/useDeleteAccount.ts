import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { showAlert } from "@/components/ui/AppAlert";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useAuthStore } from "@/contexts/authStore";
import { useLanguageStore } from "@/contexts/languageStore";
import { deleteAccount } from "@/services/users.service";
import { createDeleteAccountStyles } from "./deleteAccount.styles";

// State and handlers for app/delete-account.tsx. The server keeps a full
// safety copy of the account before anonymising it (DELETE /users/me).
export function useDeleteAccount() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = useMemo(() => createDeleteAccountStyles(tokens), [tokens]);
  const logout = useAuthStore((s) => s.logout);

  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const runDelete = async () => {
    try {
      setDeleting(true);
      await deleteAccount({ password });
    } catch (err: any) {
      setDeleting(false);
      showAlert(t("app.deleteAccount.couldntDelete"), err?.message || t("app.ride.pleaseTryAgain"));
      return;
    }
    // Same exit as signing out: the language choice is kept, only the gate resets.
    await logout();
    useLanguageStore.getState().resetLanguageGate();
    setDeleting(false);
    router.replace("/select-language");
  };

  const confirmDelete = () => {
    showAlert(t("app.deleteAccount.confirmTitle"), t("app.deleteAccount.confirmBody"), [
      { text: t("actions.cancel"), style: "cancel" },
      { text: t("app.deleteAccount.deleteForever"), style: "destructive", onPress: runDelete },
    ]);
  };

  return { tokens, styles, password, setPassword, deleting, confirmDelete };
}
