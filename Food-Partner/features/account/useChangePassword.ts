import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showAlert } from "@/components/ui/AppAlert";
import { useAuthStore } from "@/contexts/authStore";
import { useTokens } from "@/contexts/themeStore";
import { changePassword } from "@/services/auth.service";
import { errorMessage } from "@/utils/errorMessage";
import { createStyles } from "./account.styles";

const MIN_LENGTH = 6;

type Field = "current" | "next" | "confirm";

/**
 * The web panel's Settings page (useVendorPasswordChange): same rules, same
 * endpoint per outlet type, and the same sign-out afterwards so the new
 * password is used from the next sign-in on.
 */
export function useChangePassword() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const partner = useAuthStore((s) => s.partner);
  const signOut = useAuthStore((s) => s.signOut);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [loading, setLoading] = useState(false);

  const clear = (field: Field) => setErrors((e) => ({ ...e, [field]: undefined }));

  const submit = async () => {
    const found: Partial<Record<Field, string>> = {
      current: current ? undefined : t("password.currentRequired"),
      next: next.length >= MIN_LENGTH ? undefined : t("password.tooShort", { count: MIN_LENGTH }),
      confirm: next === confirm ? undefined : t("password.mismatch"),
    };
    if (!found.next && next === current) found.next = t("password.sameAsCurrent");
    setErrors(found);
    if (found.current || found.next || found.confirm || !partner) return;

    setLoading(true);
    try {
      await changePassword(partner.role, current, next);
      showAlert(t("password.changedTitle"), t("password.changedMessage"), [{ text: t("auth.signIn"), onPress: () => void signOut() }], "success");
    } catch (error) {
      setErrors({ current: errorMessage(error, t("password.changeFailed")) });
    } finally {
      setLoading(false);
    }
  };

  return {
    insets,
    tokens,
    styles,
    current,
    setCurrent: (v: string) => {
      setCurrent(v);
      clear("current");
    },
    next,
    setNext: (v: string) => {
      setNext(v);
      clear("next");
    },
    confirm,
    setConfirm: (v: string) => {
      setConfirm(v);
      clear("confirm");
    },
    errors,
    loading,
    submit,
    minLength: MIN_LENGTH,
  };
}
