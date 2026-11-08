import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/contexts/authStore";

/**
 * Tells the customer why they landed back on sign-in. The 401 handler in
 * app/_layout.tsx runs outside React, so it only raises `sessionExpired` on the
 * auth store; this renders nothing and turns that flag into a toast, once.
 */
export function SessionExpiredNotice() {
  const { t } = useTranslation();
  const toast = useToast();
  const sessionExpired = useAuthStore((s) => s.sessionExpired);
  const clearSessionExpired = useAuthStore((s) => s.clearSessionExpired);

  useEffect(() => {
    if (!sessionExpired) return;
    toast.show(t("app.SessionExpiredNotice.message"), "error");
    clearSessionExpired();
  }, [sessionExpired]);

  return null;
}
