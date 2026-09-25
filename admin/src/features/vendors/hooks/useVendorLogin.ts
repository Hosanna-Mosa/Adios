import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api-client";
import { trackEvent } from "@/lib/analytics";

export type ForgotStep = "email" | "otp" | "reset" | "done";

// Covers the union of fields read across the vendor/meat/admin/support login
// responses below -- each endpoint returns a differently-shaped payload
// (vendor/meat put the token+profile fields directly on the response, admin/
// support nest the profile under `user`), so this is intentionally loose
// rather than a precise per-branch type.
interface LoginResponse {
  token: string;
  name?: string;
  role?: string;
  user?: { name: string };
}

/** All auth/forgot-password state and logic for VendorLogin.tsx (work queue item #9). */
export function useVendorLogin() {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const isEmail = identifier.includes("@");
      const payload = isEmail ? { email: identifier, password } : { phone: identifier, password };

      let data: LoginResponse;
      let loginType: "vendor" | "admin" | "support" = "vendor";

      // 1. Try Restaurant Vendor login
      try {
        data = await adminFetch<LoginResponse>("/vendors/login", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch {
        // 2. If restaurant fails, try Meat Center login
        try {
          data = await adminFetch<LoginResponse>("/meat/login", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        } catch {
          // 3. If meat center fails, try Admin login
          try {
            data = await adminFetch<LoginResponse>("/auth/login-password", {
              method: "POST",
              body: JSON.stringify({ ...payload, role: "ADMIN" }),
            });
            loginType = "admin";
          } catch {
            // 4. If admin fails, try Support login
            try {
              data = await adminFetch<LoginResponse>("/auth/login-password", {
                method: "POST",
                body: JSON.stringify({ ...payload, role: "SUPPORT" }),
              });
              loginType = "support";
            } catch {
              throw new Error("Invalid credentials for Vendor, Admin or Support");
            }
          }
        }
      }

      trackEvent("login", { method: "password", panel_role: loginType });

      if (loginType === "admin") {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_data", JSON.stringify(data.user));
        toast.success(`Welcome back, Admin ${data.user.name}`);
        navigate("/");
      } else if (loginType === "support") {
        localStorage.setItem("support_token", data.token);
        localStorage.setItem("support_data", JSON.stringify(data.user));
        toast.success(`Welcome back, Support ${data.user.name}`);
        navigate("/support-cases");
      } else {
        localStorage.setItem("vendor_token", data.token);
        localStorage.setItem("vendor_data", JSON.stringify(data));
        toast.success(`Welcome back, ${data.name}`);
        navigate(data.role === "meat_vendor" ? "/vendor/meat-menu" : "/vendor/dashboard");
      }
    } catch (error) {
      toast.error((error as Error).message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!forgotEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      // Try meat vendor first, then restaurant vendor
      try {
        await adminFetch("/meat/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email: forgotEmail }),
        });
      } catch {
        await adminFetch("/vendors/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email: forgotEmail }),
        });
      }

      toast.success("OTP sent to your email");
      setForgotStep("otp");
    } catch (error) {
      toast.error((error as Error).message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotOtp || !forgotNewPassword || !forgotConfirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (forgotNewPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      toast.error("Passwords do not match");
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

      toast.success("Password reset successfully!");
      setForgotStep("done");
    } catch (error) {
      toast.error((error as Error).message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (!forgotOtp || forgotOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
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
