import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showAlert } from "@/components/ui/AppAlert";
import { useAuthStore } from "@/contexts/authStore";
import { useTokens } from "@/contexts/themeStore";
import { deleteMyAccount } from "@/services/auth.service";
import { errorBody, errorMessage } from "@/utils/errorMessage";
import { createStyles } from "./account.styles";

// Why the backend refused (partner-account-deletion.service), each with its own sentence.
const BLOCKED_CODES = ["PASSWORD_INCORRECT", "ACTIVE_ORDER", "SCHEDULED_PENDING", "PAYOUT_PENDING", "BALANCE_REMAINING"] as const;

/**
 * Delete account: the partner's current password confirms it, one last "are
 * you sure", then the outlet is anonymised server-side and this device signs out.
 */
export function useDeleteAccount() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const signOut = useAuthStore((s) => s.signOut);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const remove = async () => {
    setLoading(true);
    try {
      await deleteMyAccount(password);
      showAlert(t("deleteAccount.doneTitle"), t("deleteAccount.doneMessage"), [{ text: t("actions.ok"), onPress: () => void signOut() }], "success");
    } catch (failure) {
      const code = errorBody(failure).code;
      const known = BLOCKED_CODES.find((c) => c === code);
      setError(known ? t(`deleteAccount.blocked.${known}`) : errorMessage(failure, t("deleteAccount.failed")));
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    if (!password) {
      setError(t("password.currentRequired"));
      return;
    }
    showAlert(
      t("deleteAccount.confirmTitle"),
      t("deleteAccount.confirmMessage"),
      [
        { text: t("actions.cancel"), style: "cancel" },
        { text: t("deleteAccount.delete"), style: "destructive", onPress: () => void remove() },
      ],
      "warning",
    );
  };

  return {
    insets,
    tokens,
    styles,
    password,
    setPassword: (v: string) => {
      setPassword(v);
      setError(undefined);
    },
    error,
    loading,
    submit,
  };
}
