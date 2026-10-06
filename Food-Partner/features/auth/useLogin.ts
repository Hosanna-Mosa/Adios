import { useMemo, useState } from "react";
import { Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showAlert } from "@/components/ui/AppAlert";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/contexts/authStore";
import { useTokens } from "@/contexts/themeStore";
import { loginPartner } from "@/services/auth.service";
import { env } from "@/utils/env";
import { errorBody, errorMessage } from "@/utils/errorMessage";
import { createStyles } from "./auth.styles";

// State and submit for app/login.tsx — the logic of the web panel's
// useVendorLogin.ts (vendor role), minus the admin/support branches.

export function useLogin() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const toast = useToast();
  const signIn = useAuthStore((s) => s.signIn);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

  const openPartnerSite = (path: string) => {
    if (env.partnerWebUrl) Linking.openURL(`${env.partnerWebUrl}${path}`).catch(() => {});
  };

  const showFailure = (error: unknown) => {
    const body = errorBody(error);
    const message = errorMessage(error, t("auth.invalidCredentials"));
    if (body.code === "VENDOR_RESUBMISSION_REQUIRED") {
      // Documents are re-uploaded on the partner website, as in the web panel.
      const note = typeof body.note === "string" && body.note ? `\n\n${body.note}` : "";
      const buttons = env.partnerWebUrl
        ? [
            { text: t("actions.later"), style: "cancel" as const },
            { text: t("auth.resubmitDocuments"), onPress: () => openPartnerSite("/partner/resubmit") },
          ]
        : undefined;
      showAlert(t("auth.documentsNeededTitle"), `${message}${note}`, buttons, "warning");
    } else if (typeof body.code === "string" && body.code.startsWith("VENDOR_")) {
      showAlert(t("auth.applicationStatusTitle"), message, undefined, "info");
    } else {
      showAlert(t("auth.signInFailed"), message, undefined, "error");
    }
  };

  const submit = async () => {
    const next = {
      identifier: identifier.trim() ? undefined : t("auth.identifierRequired"),
      password: password ? undefined : t("auth.passwordRequired"),
    };
    setErrors(next);
    if (next.identifier || next.password) return;

    setLoading(true);
    try {
      const session = await loginPartner(identifier, password);
      await signIn(session);
      toast.show(t("auth.welcomeBack", { name: session.name }), "success");
      // The auth gate in app/_layout.tsx moves to the tabs once the token is set.
    } catch (error) {
      showFailure(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    insets,
    tokens,
    styles,
    identifier,
    setIdentifier: (value: string) => {
      setIdentifier(value);
      if (errors.identifier) setErrors((e) => ({ ...e, identifier: undefined }));
    },
    password,
    setPassword: (value: string) => {
      setPassword(value);
      if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
    },
    errors,
    loading,
    submit,
    canApply: !!env.partnerWebUrl,
    openApply: () => openPartnerSite("/partner"),
  };
}
