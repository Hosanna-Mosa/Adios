import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { trackEvent } from "@/lib/analytics";
import { socketService } from "@/lib/socketService";
import { startSession, SUPPORT_HOME, type PanelRole } from "@/lib/session";

export type ForgotStep = "email" | "otp" | "reset" | "done";

// Vendor/meat logins put the token and profile fields directly on the response;
// admin/support (/auth/login-password) nest the profile under `user`.
interface VendorLoginResponse {
  token: string;
  name?: string;
  role?: string;
}

interface StaffLoginResponse {
  token: string;
  user: { _id: string; name: string; email?: string; role: string };
}

const LOGIN_ROLE_KEY = "panel_login_role";

function getRememberedLoginRole(): PanelRole {
  try {
    const stored = localStorage.getItem(LOGIN_ROLE_KEY);
    if (stored === "admin" || stored === "support" || stored === "vendor") return stored;
  } catch {
    // Storage unavailable — fall through to the default.
  }
  return "vendor";
}

/** All auth/forgot-password state and logic for VendorLogin.tsx (work queue item #9). */
export function useVendorLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Forgot Password State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");

  const [loginRole, setLoginRoleState] = useState<PanelRole>(getRememberedLoginRole);

  const setLoginRole = (role: PanelRole) => {
    setLoginRoleState(role);
    try {
      localStorage.setItem(LOGIN_ROLE_KEY, role);
    } catch {
      // Only a convenience — the dropdown just starts on "vendor" next time.
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error(t("vendorAuth.pleaseFillInAllFields"));
      return;
    }

    setIsLoading(true);
    try {
      const isEmail = identifier.includes("@");
      const payload = isEmail ? { email: identifier, password } : { phone: identifier, password };

      // The chosen role decides the one endpoint we try. The server checks the
      // account's role too, so picking "Admin" with support credentials fails.
      if (loginRole === "admin" || loginRole === "support") {
        const data = await adminFetch<StaffLoginResponse>("/auth/login-password", {
          method: "POST",
          body: JSON.stringify({ ...payload, role: loginRole === "admin" ? "ADMIN" : "SUPPORT" }),
        });

        trackEvent("login", { method: "password", panel_role: loginRole });
        startSession(loginRole, data.token, data.user);
        socketService.disconnect();

        if (loginRole === "admin") {
          toast.success(t("vendorAuth.welcomeBackAdmin", { name: data.user.name, defaultValue: "Welcome back, Admin {{name}}" }));
          navigate("/");
        } else {
          toast.success(t("vendorAuth.welcomeBackSupport", { name: data.user.name, defaultValue: "Welcome back, Support {{name}}" }));
          navigate(SUPPORT_HOME);
        }
        return;
      }

      let data: VendorLoginResponse;
      // 1. Try Restaurant Vendor login
      try {
        data = await adminFetch<VendorLoginResponse>("/vendors/login", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch {
        // 2. If restaurant fails, try Meat Center login
        data = await adminFetch<VendorLoginResponse>("/meat/login", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      trackEvent("login", { method: "password", panel_role: "vendor" });
      startSession("vendor", data.token, data);
      socketService.disconnect();
      toast.success(t("vendorAuth.welcomeBack", { name: data.name, defaultValue: "Welcome back, {{name}}" }));
      navigate(data.role === "meat_vendor" ? "/vendor/meat-menu" : "/vendor/dashboard");
    } catch (error) {
      toast.error((error as Error).message || t("vendorAuth.invalidCredentials"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!forgotEmail) {
      toast.error(t("vendorAuth.pleaseEnterYourEmailAddress"));
      return;
    }

    setIsLoading(true);
    try {
      // Both endpoints now answer the same generic "if an account exists"
      // message whether or not this email matches one of their accounts — they
      // no longer 404 on a miss — so trying meat first and falling through to
      // vendor on failure would never reach the vendor call. Fire both; each
      // sends its own email if (and only if) the address belongs to that kind
      // of account, so a restaurant vendor and a meat-centre vendor sharing an
      // email would simply get two.
      const [meatResult, vendorResult] = await Promise.allSettled([
        adminFetch("/meat/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email: forgotEmail }),
        }),
        adminFetch("/vendors/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email: forgotEmail }),
        }),
      ]);

      if (meatResult.status === "rejected" && vendorResult.status === "rejected") {
        throw (vendorResult as PromiseRejectedResult).reason;
      }

      toast.success(t("vendorAuth.otpSentIfAccountExists"));
      setForgotStep("otp");
    } catch (error) {
      toast.error((error as Error).message || t("vendorAuth.failedToSendOtp"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotOtp || !forgotNewPassword || !forgotConfirmPassword) {
      toast.error(t("vendorAuth.pleaseFillInAllFields"));
      return;
    }

    if (forgotNewPassword.length < 6) {
      toast.error(t("vendorAuth.passwordMustBeAtLeast6Characters"));
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      toast.error(t("vendorAuth.passwordsDoNotMatch"));
      return;
    }

    setIsLoading(true);
    try {
      // Try meat vendor first, then restaurant vendor
      try {
        await adminFetch("/meat/reset-password", {
          method: "POST",
          body: JSON.stringify({
            email: forgotEmail,
            otp: forgotOtp,
            newPassword: forgotNewPassword,
          }),
        });
      } catch {
        await adminFetch("/vendors/reset-password", {
          method: "POST",
          body: JSON.stringify({
            email: forgotEmail,
            otp: forgotOtp,
            newPassword: forgotNewPassword,
          }),
        });
      }

      toast.success(t("vendorAuth.passwordResetSuccessBang"));
      setForgotStep("done");
    } catch (error) {
      toast.error((error as Error).message || t("vendorAuth.failedToResetPassword"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (!forgotOtp || forgotOtp.length !== 6) {
      toast.error(t("vendorAuth.pleaseEnterValid6DigitOtp"));
      return;
    }
    setForgotStep("reset");
  };

  // Kept distinct from closeForgotFlow: canceling from the email step doesn't
  // clear what was typed (in case the admin reopens the flow), while
  // finishing the flow via closeForgotFlow resets everything for next time.
  const cancelForgotFlow = () => {
    setShowForgot(false);
    setForgotStep("email");
  };

  const closeForgotFlow = () => {
    setShowForgot(false);
    setForgotStep("email");
    setForgotEmail("");
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
  };

  return {
    loginRole,
    setLoginRole,
    isLoading,
    identifier,
    setIdentifier,
    password,
    setPassword,
    handleLogin,
    showForgot,
    setShowForgot,
    forgotStep,
    setForgotStep,
    forgotEmail,
    setForgotEmail,
    forgotOtp,
    setForgotOtp,
    forgotNewPassword,
    setForgotNewPassword,
    forgotConfirmPassword,
    setForgotConfirmPassword,
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
    cancelForgotFlow,
    closeForgotFlow,
  };
}
